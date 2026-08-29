// File: modules/billing/handler/billing_handler.go
package handler

import (
	"strconv"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	billingErrs "ruang-tukar/modules/billing/errs"
	"ruang-tukar/modules/billing/domain/service"
	"ruang-tukar/modules/billing/dto/response"

	"github.com/labstack/echo/v5"
)

type BillingHandler struct {
	subService     *service.SubscriptionService
	invoiceService *service.InvoiceService
	log            *logger.Logger
	event          *bus.EventBus
	r              *utils.Response
}

func NewBillingHandler(
	log *logger.Logger,
	event *bus.EventBus,
	subService *service.SubscriptionService,
	invoiceService *service.InvoiceService,
) *BillingHandler {
	return &BillingHandler{
		subService:     subService,
		invoiceService: invoiceService,
		log:            log,
		event:          event,
		r:              &utils.Response{},
	}
}

// GetUserSubscriptions returns subscriptions for user
func (h *BillingHandler) GetUserSubscriptions(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	subs, err := h.subService.GetUserSubscriptions(ctx, userID)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromSubscriptionEntities(subs), "Subscriptions retrieved successfully")
}

// GetUserInvoices returns invoices for user
func (h *BillingHandler) GetUserInvoices(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	invoices, err := h.invoiceService.GetUserInvoices(ctx, userID)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, invoices, "Invoices retrieved successfully")
}

// GetInvoiceByID returns invoice detail
func (h *BillingHandler) GetInvoiceByID(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid invoice ID"))
	}

	inv, err := h.invoiceService.GetInvoiceByID(ctx, uint(id))
	if err != nil {
		if err == billingErrs.ErrInvoiceNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	if userRole != middleware.RoleAdmin && inv.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	return h.r.SuccessResponse(c, inv, "Invoice retrieved successfully")
}

// ToggleAutoRenew toggles auto-renewal for subscription
func (h *BillingHandler) ToggleAutoRenew(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid subscription ID"))
	}

	sub, err := h.subService.GetSubscriptionByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if sub.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	sub.AutoRenew = !sub.AutoRenew
	_ = h.subService.SetContainerID(ctx, sub.ID, *sub.ContainerID)

	return h.r.SuccessResponse(c, response.FromSubscriptionEntity(sub), "Auto renew setting updated")
}

// GetAllSubscriptions (admin)
func (h *BillingHandler) GetAllSubscriptions(c *echo.Context) error {
	ctx := c.Request().Context()
	subs, err := h.subService.GetAllSubscriptions(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromSubscriptionEntities(subs), "All subscriptions retrieved successfully")
}

// GetAllInvoices (admin)
func (h *BillingHandler) GetAllInvoices(c *echo.Context) error {
	ctx := c.Request().Context()
	invoices, err := h.invoiceService.GetAllInvoices(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, invoices, "All invoices retrieved successfully")
}

func (h *BillingHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath+"/billing", middleware.Auth)
	group.GET("/subscriptions", h.GetUserSubscriptions)
	group.PATCH("/subscriptions/:id/auto-renew", h.ToggleAutoRenew)
	group.GET("/invoices", h.GetUserInvoices)
	group.GET("/invoices/:id", h.GetInvoiceByID)

	adminGroup := e.Group(basePath+"/admin/billing", middleware.RequireAdmin)
	adminGroup.GET("/subscriptions", h.GetAllSubscriptions)
	adminGroup.GET("/invoices", h.GetAllInvoices)
}
