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

	order, err := h.orderService.CreateNewPurchaseOrder(ctx, userID, req.PlanID)
	if err != nil {
		if err == orderErrs.ErrPlanLimitReached {
			return h.r.BadRequestResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.CreatedResponse(c, response.FromEntity(order), "Order created successfully")
}

// GetUserOrders gets all orders for authenticated user
func (h *OrderHandler) GetUserOrders(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	orders, err := h.orderService.GetOrdersByUserID(ctx, userID)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntities(orders), "Orders retrieved successfully")
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
		"total_revenue": totalRevenue,
		"total_orders":  len(orders),
		"paid_orders":   paidCount,
		"pending_orders": pendingCount,
	}

	return h.r.SuccessResponse(c, stats, "Order statistics retrieved successfully")
}

// RegisterRoutes registers order routes
func (h *OrderHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	// User routes
	userGroup := e.Group(basePath+"/orders", middleware.Auth)
	userGroup.POST("", h.CreateOrder)
	userGroup.GET("", h.GetUserOrders)
	userGroup.GET("/:id", h.GetOrderByID)

	// Admin routes
	adminGroup := e.Group(basePath+"/admin/orders", middleware.RequireAdmin)
	adminGroup.GET("", h.GetAllOrders)
	adminGroup.GET("/stats", h.GetOrderStats)
}
