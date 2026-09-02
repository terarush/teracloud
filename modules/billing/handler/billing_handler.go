// File: modules/billing/handler/billing_handler.go
package handler

import (
	"strconv"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	billingErrs "ruang-tukar/modules/billing/errs"
	"ruang-tukar/modules/billing/domain/entity"
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

// GetSubscriptions returns subscriptions (role-aware: user gets own, admin gets all)
func (h *BillingHandler) GetSubscriptions(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, billingErrs.ErrBillingUnauthorized)
	}

	var subs []*entity.Subscription
	var err error
	if userRole == middleware.RoleAdmin {
		subs, err = h.subService.GetAllSubscriptions(ctx)
	} else {
		subs, err = h.subService.GetUserSubscriptions(ctx, userID)
	}

	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromSubscriptionEntities(subs), "msg.billing.subs_retrieved")
}

// GetUserSubscriptions returns subscriptions for user
func (h *BillingHandler) GetUserSubscriptions(c *echo.Context) error {
	return h.GetSubscriptions(c)
}

// GetInvoices returns invoices (role-aware: user gets own, admin gets all)
func (h *BillingHandler) GetInvoices(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, billingErrs.ErrBillingUnauthorized)
	}

	var invoices []*entity.Invoice
	var err error
	if userRole == middleware.RoleAdmin {
		invoices, err = h.invoiceService.GetAllInvoices(ctx)
	} else {
		invoices, err = h.invoiceService.GetUserInvoices(ctx, userID)
	}

	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, invoices, "msg.billing.invoices_retrieved")
}

// GetUserInvoices returns invoices for user
func (h *BillingHandler) GetUserInvoices(c *echo.Context) error {
	return h.GetInvoices(c)
}

// GetInvoiceByID returns invoice detail
func (h *BillingHandler) GetInvoiceByID(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, billingErrs.ErrInvoiceInvalidID)
	}

	inv, err := h.invoiceService.GetInvoiceByID(ctx, uint(id))
	if err != nil {
		if err == billingErrs.ErrInvoiceNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	if userRole != middleware.RoleAdmin && inv.UserID != userID {
		return h.r.ForbiddenResponse(c, billingErrs.ErrBillingForbidden)
	}

	return h.r.SuccessResponse(c, inv, "msg.billing.invoice_retrieved")
}

// ToggleAutoRenew toggles auto-renewal for subscription
func (h *BillingHandler) ToggleAutoRenew(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, billingErrs.ErrSubInvalidID)
	}

	sub, err := h.subService.GetSubscriptionByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && sub.UserID != userID {
		return h.r.ForbiddenResponse(c, billingErrs.ErrBillingForbidden)
	}

	sub.AutoRenew = !sub.AutoRenew
	if sub.ContainerID != nil {
		_ = h.subService.SetContainerID(ctx, sub.ID, *sub.ContainerID)
	}

	return h.r.SuccessResponse(c, response.FromSubscriptionEntity(sub), "msg.billing.auto_renew_updated")
}

// GetAllSubscriptions (admin)
func (h *BillingHandler) GetAllSubscriptions(c *echo.Context) error {
	ctx := c.Request().Context()
	subs, err := h.subService.GetAllSubscriptions(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromSubscriptionEntities(subs), "msg.billing.all_subs_retrieved")
}

// GetAllInvoices (admin)
func (h *BillingHandler) GetAllInvoices(c *echo.Context) error {
	ctx := c.Request().Context()
	invoices, err := h.invoiceService.GetAllInvoices(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, invoices, "msg.billing.all_invoices_retrieved")
}

// GetBillingStats returns billing stats (admin)
func (h *BillingHandler) GetBillingStats(c *echo.Context) error {
	ctx := c.Request().Context()
	subs, err := h.subService.GetAllSubscriptions(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	invoices, err := h.invoiceService.GetAllInvoices(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	var totalRevenue int64
	var paidInvoices int
	for _, inv := range invoices {
		if inv.Status == "paid" {
			totalRevenue += inv.Total
			paidInvoices++
		}
	}

	stats := map[string]interface{}{
		"total_revenue":       totalRevenue,
		"total_subscriptions": len(subs),
		"total_invoices":      len(invoices),
		"paid_invoices":       paidInvoices,
	}

	return h.r.SuccessResponse(c, stats, "msg.billing.stats_retrieved")
}

func (h *BillingHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath+"/billing", middleware.Auth)
	group.GET("/subscriptions", h.GetSubscriptions)
	group.PATCH("/subscriptions/:id/auto-renew", h.ToggleAutoRenew)
	group.GET("/invoices", h.GetInvoices)
	group.GET("/invoices/:id", h.GetInvoiceByID)
	group.GET("/stats", h.GetBillingStats, middleware.RequireAdmin)
}
