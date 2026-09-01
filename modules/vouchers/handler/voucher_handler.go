// File: modules/vouchers/handler/voucher_handler.go
package handler

import (
	"strconv"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/audit"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	"ruang-tukar/internal/pkg/validator"
	"ruang-tukar/modules/vouchers/domain/entity"
	"ruang-tukar/modules/vouchers/domain/service"
	"ruang-tukar/modules/vouchers/dto/request"
	"ruang-tukar/modules/vouchers/dto/response"
	voucherErrs "ruang-tukar/modules/vouchers/errs"

	"github.com/labstack/echo/v5"
)

type VoucherHandler struct {
	voucherService *service.VoucherService
	log            *logger.Logger
	r              *utils.Response
}

func NewVoucherHandler(log *logger.Logger, voucherService *service.VoucherService) *VoucherHandler {
	return &VoucherHandler{
		voucherService: voucherService,
		log:            log,
		r:              &utils.Response{},
	}
}

// CreateVoucher handles admin voucher creation.
func (h *VoucherHandler) CreateVoucher(c *echo.Context) error {
	ctx := c.Request().Context()

	req := new(request.CreateVoucherRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, voucherErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	appliesTo := req.AppliesTo
	if appliesTo == "" {
		appliesTo = entity.AppliesToAll
	}
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	voucher := &entity.Voucher{
		Code:              req.Code,
		Name:              req.Name,
		Description:       req.Description,
		DiscountType:      req.DiscountType,
		DiscountValue:     req.DiscountValue,
		MinOrderAmount:    req.MinOrderAmount,
		MaxDiscountAmount: req.MaxDiscountAmount,
		AppliesTo:         appliesTo,
		TotalUsageLimit:   req.TotalUsageLimit,
		PerUserUsageLimit: req.PerUserUsageLimit,
		StartAt:           req.StartAt,
		EndAt:             req.EndAt,
		IsActive:          isActive,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := h.voucherService.CreateVoucher(ctx, voucher, req.PlanIDs); err != nil {
		if err == voucherErrs.ErrVoucherCodeExists {
			return h.r.ConflictResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	userID := utils.UserIDFromCtx(c)
	audit.LogAsync(audit.Params{
		UserID: &userID, ActorType: "admin", SchemaName: "hosting",
		TableName: "vouchers", RecordID: voucher.ID, Action: "create",
		Summary: "Admin created voucher: " + voucher.Code, Module: "vouchers",
		NewValues: voucher,
	})

	return h.r.CreatedResponse(c, response.FromEntity(voucher), "Voucher created successfully")
}

// UpdateVoucher handles admin voucher update.
func (h *VoucherHandler) UpdateVoucher(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid voucher ID"))
	}

	voucher, err := h.voucherService.GetVoucherByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, voucherErrs.ErrVoucherNotFound)
	}

	req := new(request.UpdateVoucherRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, voucherErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	if req.Name != "" {
		voucher.Name = req.Name
	}
	if req.Description != "" {
		voucher.Description = req.Description
	}
	if req.DiscountType != "" {
		voucher.DiscountType = req.DiscountType
	}
	if req.DiscountValue != 0 {
		voucher.DiscountValue = req.DiscountValue
	}
	if req.MinOrderAmount != 0 {
		voucher.MinOrderAmount = req.MinOrderAmount
	}
	if req.AppliesTo != "" {
		voucher.AppliesTo = req.AppliesTo
	}
	if req.MaxDiscountAmount != nil {
		voucher.MaxDiscountAmount = req.MaxDiscountAmount
	}
	if req.TotalUsageLimit != nil {
		voucher.TotalUsageLimit = req.TotalUsageLimit
	}
	if req.PerUserUsageLimit != nil {
		voucher.PerUserUsageLimit = req.PerUserUsageLimit
	}
	if req.StartAt != nil {
		voucher.StartAt = req.StartAt
	}
	if req.EndAt != nil {
		voucher.EndAt = req.EndAt
	}
	if req.IsActive != nil {
		voucher.IsActive = *req.IsActive
	}
	voucher.UpdatedAt = time.Now()

	if err := h.voucherService.UpdateVoucher(ctx, voucher, req.PlanIDs); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(voucher), "Voucher updated successfully")
}

// DeleteVoucher handles admin voucher deletion.
func (h *VoucherHandler) DeleteVoucher(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid voucher ID"))
	}

	if err := h.voucherService.DeleteVoucher(ctx, uint(id)); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.NoContentResponse(c)
}

// ToggleVoucher activates/deactivates a voucher (admin).
func (h *VoucherHandler) ToggleVoucher(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid voucher ID"))
	}

	voucher, err := h.voucherService.ToggleVoucher(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, voucherErrs.ErrVoucherNotFound)
	}

	return h.r.SuccessResponse(c, response.FromEntity(voucher), "Voucher toggled successfully")
}

// ListVouchers returns all vouchers (admin).
func (h *VoucherHandler) ListVouchers(c *echo.Context) error {
	ctx := c.Request().Context()
	vouchers, err := h.voucherService.ListVouchers(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntities(vouchers), "Vouchers retrieved successfully")
}

// GetVoucher returns a single voucher by ID (admin).
func (h *VoucherHandler) GetVoucher(c *echo.Context) error {
	ctx := c.Request().Context()
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid voucher ID"))
	}
	voucher, err := h.voucherService.GetVoucherByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, voucherErrs.ErrVoucherNotFound)
	}
	return h.r.SuccessResponse(c, response.FromEntity(voucher), "Voucher retrieved successfully")
}

// RegisterRoutes registers voucher routes.
func (h *VoucherHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	admin := e.Group(basePath+"/vouchers", middleware.RequireAdmin)
	admin.GET("", h.ListVouchers)
	admin.GET("/:id", h.GetVoucher)
	admin.POST("", h.CreateVoucher)
	admin.PUT("/:id", h.UpdateVoucher)
	admin.DELETE("/:id", h.DeleteVoucher)
	admin.PATCH("/:id/toggle", h.ToggleVoucher)
}
