// File: modules/orders/handler/order_handler.go
package handler

import (
	"strconv"
	"strings"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	"ruang-tukar/internal/pkg/validator"
	orderErrs "ruang-tukar/modules/orders/errs"
	"ruang-tukar/modules/orders/domain/entity"
	"ruang-tukar/modules/orders/domain/service"
	"ruang-tukar/modules/orders/dto/request"
	"ruang-tukar/modules/orders/dto/response"

	"github.com/labstack/echo/v5"
)

type OrderHandler struct {
	orderService *service.OrderService
	log          *logger.Logger
	event        *bus.EventBus
	r            *utils.Response
}

func NewOrderHandler(log *logger.Logger, event *bus.EventBus, orderService *service.OrderService) *OrderHandler {
	return &OrderHandler{
		orderService: orderService,
		log:          log,
		event:        event,
		r:            &utils.Response{},
	}
}

// CreateOrder handles creating a new purchase order
func (h *OrderHandler) CreateOrder(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	req := new(request.CreateOrderRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, orderErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	duration := req.DurationMonths
	if duration <= 0 {
		duration = 1
	}

	order, err := h.orderService.CreateNewPurchaseOrder(ctx, userID, req.PlanID, req.CustomName, duration)
	if err != nil {
		if err == orderErrs.ErrPlanLimitReached {
			return h.r.BadRequestResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.CreatedResponse(c, response.FromEntity(order), "Order created successfully")
}

// CheckoutCart handles creating an order from user cart
func (h *OrderHandler) CheckoutCart(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	req := new(request.CheckoutCartRequest)
	_ = c.Bind(req)

	order, err := h.orderService.CheckoutCart(ctx, userID, req.CartItemIDs)
	if err != nil {
		if err == orderErrs.ErrPlanLimitReached || err == orderErrs.ErrOrderNotFound {
			return h.r.BadRequestResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.CreatedResponse(c, response.FromEntity(order), "Checkout initiated successfully")
}

// GetOrderStatus gets real-time order & provisioning status
func (h *OrderHandler) GetOrderStatus(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)
	param := c.Param("id")

	var order *entity.Order
	var err error

	// Support query by numeric ID or by order_number string
	if id, parseErr := strconv.ParseUint(param, 10, 32); parseErr == nil {
		order, err = h.orderService.GetOrderByID(ctx, uint(id))
	} else {
		order, err = h.orderService.GetOrderByOrderNumber(ctx, param)
	}

	if err != nil {
		return h.r.NotFoundResponse(c, orderErrs.ErrOrderNotFound)
	}

	if userRole != middleware.RoleAdmin && order.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Access denied"))
	}

	return h.r.SuccessResponse(c, response.FromEntity(order), "Order status retrieved")
}

// GetOrders gets orders (role-aware: user gets own, admin gets all)
func (h *OrderHandler) GetOrders(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	var orders []*entity.Order
	var err error
	if userRole == middleware.RoleAdmin {
		orders, err = h.orderService.GetAllOrders(ctx)
	} else {
		orders, err = h.orderService.GetOrdersByUserID(ctx, userID)
	}

	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntities(orders), "Orders retrieved successfully")
}

// GetUserOrders gets all orders for authenticated user
func (h *OrderHandler) GetUserOrders(c *echo.Context) error {
	return h.GetOrders(c)
}

// GetOrderByID gets order details
func (h *OrderHandler) GetOrderByID(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid order ID"))
	}

	order, err := h.orderService.GetOrderByID(ctx, uint(id))
	if err != nil {
		if err == orderErrs.ErrOrderNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	// Ownership check
	if userRole != middleware.RoleAdmin && order.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "You do not have access to this order"))
	}

	return h.r.SuccessResponse(c, response.FromEntity(order), "Order retrieved successfully")
}

// GetAllOrders gets all orders (admin)
func (h *OrderHandler) GetAllOrders(c *echo.Context) error {
	ctx := c.Request().Context()
	orders, err := h.orderService.GetAllOrders(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntities(orders), "All orders retrieved successfully")
}

// GetOrderStats calculates revenue statistics (admin)
func (h *OrderHandler) GetOrderStats(c *echo.Context) error {
	ctx := c.Request().Context()
	orders, err := h.orderService.GetAllOrders(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	var totalRevenue int64
	var paidCount int
	var pendingCount int

	for _, o := range orders {
		if o.Status == "paid" {
			totalRevenue += o.Amount
			paidCount++
		} else if o.Status == "awaiting_payment" {
			pendingCount++
		}
	}

	stats := map[string]interface{}{
		"total_revenue":  totalRevenue,
		"total_orders":   len(orders),
		"paid_orders":    paidCount,
		"pending_orders": pendingCount,
	}

	return h.r.SuccessResponse(c, stats, "Order statistics retrieved successfully")
}

// RegisterRoutes registers order routes
func (h *OrderHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	// Protected user/admin routes
	group := e.Group(basePath+"/orders", middleware.Auth)
	group.POST("", h.CreateOrder)
	group.POST("/checkout", h.CheckoutCart)
	group.GET("", h.GetOrders)
	group.GET("/stats", h.GetOrderStats, middleware.RequireAdmin)
	group.GET("/:id/status", h.GetOrderStatus)
	group.GET("/:id", h.GetOrderByID)
}
