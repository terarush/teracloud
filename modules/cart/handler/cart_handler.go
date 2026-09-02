// File: modules/cart/handler/cart_handler.go
package handler

import (
	"strconv"
	"strings"

	"teracloud/internal/pkg/logger"
	"teracloud/internal/pkg/utils"
	"teracloud/internal/pkg/validator"
	"teracloud/modules/cart/domain/service"
	"teracloud/modules/cart/dto/request"
	"teracloud/modules/cart/dto/response"
	cartErrs "teracloud/modules/cart/errs"

	"github.com/labstack/echo/v5"
)

type CartHandler struct {
	cartService *service.CartService
	log         *logger.Logger
	r           *utils.Response
}

func NewCartHandler(log *logger.Logger, cartService *service.CartService) *CartHandler {
	return &CartHandler{
		cartService: cartService,
		log:         log,
		r:           &utils.Response{},
	}
}

func (h *CartHandler) GetCart(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)

	items, err := h.cartService.GetCart(ctx, userID)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntities(items), "msg.cart.retrieved")
}

func (h *CartHandler) AddToCart(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)

	req := new(request.AddToCartRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, cartErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	item, err := h.cartService.AddToCart(ctx, userID, req.PlanID, req.CustomName, req.DurationMonths, req.EnvironmentConfig)
	if err != nil {
		if err == cartErrs.ErrPlanNotActive {
			return h.r.BadRequestResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.CreatedResponse(c, response.FromEntity(item), "msg.cart.item_added")
}

func (h *CartHandler) UpdateCartItem(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, cartErrs.ErrCartInvalidItemID)
	}

	req := new(request.UpdateCartItemRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, cartErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	var envBytes *[]byte
	if req.EnvironmentConfig != nil {
		b := []byte(*req.EnvironmentConfig)
		envBytes = &b
	}

	item, err := h.cartService.UpdateCartItem(ctx, userID, uint(id), req.CustomName, req.DurationMonths, envBytes)
	if err != nil {
		if err == cartErrs.ErrCartItemNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(item), "msg.cart.item_updated")
}

func (h *CartHandler) RemoveFromCart(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, cartErrs.ErrCartInvalidItemID)
	}

	if err := h.cartService.RemoveFromCart(ctx, userID, uint(id)); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, nil, "msg.cart.item_removed")
}

func (h *CartHandler) ClearCart(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)

	if err := h.cartService.ClearCart(ctx, userID); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, nil, "msg.cart.cleared")
}
