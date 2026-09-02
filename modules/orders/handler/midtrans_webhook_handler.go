// File: modules/orders/handler/midtrans_webhook_handler.go
package handler

import (
	"teracloud/internal/pkg/logger"
	"teracloud/internal/pkg/utils"
	orderErrs "teracloud/modules/orders/errs"
	"teracloud/modules/orders/domain/service"

	"github.com/labstack/echo/v5"
)

type WebhookHandler struct {
	orderService *service.OrderService
	log          *logger.Logger
	r            *utils.Response
}

func NewWebhookHandler(log *logger.Logger, orderService *service.OrderService) *WebhookHandler {
	return &WebhookHandler{
		orderService: orderService,
		log:          log,
		r:            &utils.Response{},
	}
}

// HandleMidtrans processes incoming webhooks from Midtrans.
func (h *WebhookHandler) HandleMidtrans(c *echo.Context) error {
	ctx := c.Request().Context()

	var payload map[string]interface{}
	if err := c.Bind(&payload); err != nil {
		h.log.Error("Failed to parse midtrans webhook payload: %v", err)
		return h.r.BadRequestResponse(c, err)
	}

	h.log.Info("Received midtrans webhook for order: %v", payload["order_id"])

	if err := h.orderService.HandleWebhookNotification(ctx, payload); err != nil {
		h.log.Error("Error processing midtrans webhook: %v", err)
		if err == orderErrs.ErrInvalidWebhookSignature {
			return h.r.ForbiddenResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"status": "ok"}, "msg.orders.webhook_processed")
}

func (h *WebhookHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	e.POST(basePath+"/webhooks/midtrans", h.HandleMidtrans)
}
