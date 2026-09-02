// File: modules/plans/handler/plan_handler.go
package handler

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/audit"
	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	"ruang-tukar/internal/pkg/validator"
	planErrs "ruang-tukar/modules/plans/errs"
	"ruang-tukar/modules/plans/domain/entity"
	"ruang-tukar/modules/plans/domain/service"
	"ruang-tukar/modules/plans/dto/request"
	"ruang-tukar/modules/plans/dto/response"

	"github.com/labstack/echo/v5"
)

type PlanHandler struct {
	planService *service.PlanService
	log         *logger.Logger
	event       *bus.EventBus
	r           *utils.Response
}

func NewPlanHandler(log *logger.Logger, event *bus.EventBus, planService *service.PlanService) *PlanHandler {
	return &PlanHandler{
		planService: planService,
		log:         log,
		event:       event,
		r:           &utils.Response{},
	}
}

// GetActivePlans returns all active plans (public)
func (h *PlanHandler) GetActivePlans(c *echo.Context) error {
	ctx := c.Request().Context()
	plans, err := h.planService.GetActivePlans(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntities(plans), "msg.plans.list_retrieved")
}

// GetPlanBySlug returns a plan by slug (public)
func (h *PlanHandler) GetPlanBySlug(c *echo.Context) error {
	ctx := c.Request().Context()
	slug := c.Param("slug")

	plan, err := h.planService.GetPlanBySlug(ctx, slug)
	if err != nil {
		if err == planErrs.ErrPlanNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntity(plan), "msg.plans.retrieved")
}

// GetAllPlans returns all plans including inactive (admin)
func (h *PlanHandler) GetAllPlans(c *echo.Context) error {
	ctx := c.Request().Context()
	plans, err := h.planService.GetAllPlans(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntities(plans), "msg.plans.list_retrieved")
}

// CreatePlan creates a new plan (admin)
func (h *PlanHandler) CreatePlan(c *echo.Context) error {
	ctx := c.Request().Context()

	req := new(request.CreatePlanRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, planErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	category := req.Category
	if category == "" {
		category = "os"
	}

	plan := &entity.Plan{
		Name:                strings.TrimSpace(req.Name),
		Description:         req.Description,
		ShortDescription:    req.ShortDescription,
		ImageName:           strings.TrimSpace(req.ImageName),
		ImageTag:            strings.TrimSpace(req.ImageTag),
		ThumbnailURL:        req.ThumbnailURL,
		Category:            category,
		Badge:               req.Badge,
		IsFeatured:          req.IsFeatured,
		StockLimit:          req.StockLimit,
		CPULimit:            req.CPULimit,
		MemoryLimit:         req.MemoryLimit,
		DiskLimit:           req.DiskLimit,
		BandwidthLimit:      req.BandwidthLimit,
		PriceMonthly:        req.PriceMonthly,
		IsActive:            true,
		SortOrder:           req.SortOrder,
		Features:            req.Features,
		PortConfig:          req.PortConfig,
		EnvironmentTemplate: req.EnvironmentTemplate,
		Command:             req.Command,
		Entrypoint:          req.Entrypoint,
		Icon:                req.Icon,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := h.planService.CreatePlan(ctx, plan); err != nil {
		if err == planErrs.ErrPlanSlugExists {
			return h.r.ConflictResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	userID := utils.UserIDFromCtx(c)
	audit.LogAsync(audit.Params{
		UserID: &userID, ActorType: "admin", SchemaName: "hosting",
		TableName: "plans", RecordID: plan.ID, Action: "create",
		Summary: "Admin created plan: " + plan.Name, Module: "plans",
		NewValues: plan,
	})

	return h.r.CreatedResponse(c, response.FromEntity(plan), "msg.plans.created")
}

// UpdatePlan updates a plan (admin)
func (h *PlanHandler) UpdatePlan(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, planErrs.ErrPlanInvalidID)
	}

	plan, err := h.planService.GetPlanByID(ctx, uint(id))
	if err != nil {
		if err == planErrs.ErrPlanNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	req := new(request.UpdatePlanRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, planErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	oldFeatures := make(json.RawMessage, len(plan.Features))
	copy(oldFeatures, plan.Features)

	plan.Name = strings.TrimSpace(req.Name)
	plan.Description = req.Description
	plan.ShortDescription = req.ShortDescription
	plan.ImageName = strings.TrimSpace(req.ImageName)
	plan.ImageTag = strings.TrimSpace(req.ImageTag)
	plan.ThumbnailURL = req.ThumbnailURL
	if req.Category != "" {
		plan.Category = req.Category
	}
	plan.Badge = req.Badge
	plan.IsFeatured = req.IsFeatured
	plan.StockLimit = req.StockLimit
	plan.CPULimit = req.CPULimit
	plan.MemoryLimit = req.MemoryLimit
	plan.DiskLimit = req.DiskLimit
	plan.BandwidthLimit = req.BandwidthLimit
	plan.PriceMonthly = req.PriceMonthly
	plan.IsActive = req.IsActive
	plan.Features = req.Features
	plan.PortConfig = req.PortConfig
	plan.EnvironmentTemplate = req.EnvironmentTemplate
	plan.Command = req.Command
	plan.Entrypoint = req.Entrypoint
	plan.Icon = req.Icon
	plan.SortOrder = req.SortOrder
	plan.UpdatedAt = time.Now()

	if err := h.planService.UpdatePlan(ctx, plan); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(plan), "msg.plans.updated")
}

// DeletePlan soft-deletes a plan (admin)
func (h *PlanHandler) DeletePlan(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, planErrs.ErrPlanInvalidID)
	}

	if err := h.planService.DeletePlan(ctx, uint(id)); err != nil {
		if err == planErrs.ErrPlanNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.NoContentResponse(c)
}

// TogglePlan toggles plan active status (admin)
func (h *PlanHandler) TogglePlan(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, planErrs.ErrPlanInvalidID)
	}

	plan, err := h.planService.TogglePlan(ctx, uint(id))
	if err != nil {
		if err == planErrs.ErrPlanNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(plan), "msg.plans.toggled")
}

// GetPlans handles GET /plans (public active plans, admin gets all plans if admin)
func (h *PlanHandler) GetPlans(c *echo.Context) error {
	ctx := c.Request().Context()
	userRole := utils.UserRoleFromCtx(c)

	var plans []*entity.Plan
	var err error
	if userRole == middleware.RoleAdmin {
		plans, err = h.planService.GetAllPlans(ctx)
	} else {
		plans, err = h.planService.GetActivePlans(ctx)
	}

	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntities(plans), "msg.plans.list_retrieved")
}

// RegisterRoutes registers plan routes
func (h *PlanHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	// Public routes
	pub := e.Group(basePath+"/plans")
	pub.GET("", h.GetPlans)
	pub.GET("/:slug", h.GetPlanBySlug)

	// Protected admin routes
	admin := e.Group(basePath+"/plans", middleware.RequireAdmin)
	admin.POST("", h.CreatePlan)
	admin.PUT("/:id", h.UpdatePlan)
	admin.DELETE("/:id", h.DeletePlan)
	admin.PATCH("/:id/toggle", h.TogglePlan)
}
