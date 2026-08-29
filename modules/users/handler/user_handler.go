package handler

import (
	"ruang-tukar/internal/pkg/audit"
	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	"ruang-tukar/internal/pkg/validator"
	userErrs "ruang-tukar/modules/users/errs"
	"ruang-tukar/modules/users/domain/entity"
	"ruang-tukar/modules/users/domain/service"
	"ruang-tukar/modules/users/dto/request"
	"ruang-tukar/modules/users/dto/response"
	"strconv"
	"strings"

	"github.com/labstack/echo/v5"
)

// UserHandler handles HTTP requests for users
type UserHandler struct {
	userService *service.UserService
	log         *logger.Logger
	event       *bus.EventBus
	r           *utils.Response
}

// NewUserHandler creates a new user handler
func NewUserHandler(log *logger.Logger, event *bus.EventBus, userService *service.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
		log:         log,
		event:       event,
		r:           &utils.Response{},
	}
}

func (h *UserHandler) Handle(event bus.Event) {
	h.log.Info("User created event: %v", event.Payload)
}

// GetAllUsers gets all users
// @Summary List all users
// @Description Get a list of all registered users
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=[]response.UserResponse}
// @Failure 500 {object} utils.Response
// @Router /users [get]
func (h *UserHandler) GetAllUsers(c *echo.Context) error {
	ctx := c.Request().Context()

	users, err := h.userService.GetAllUsers(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntities(users), "Users retrieved successfully")
}

// GetUser gets a user by ID
// @Summary Get user by ID
// @Description Get a single user by their ID
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 200 {object} response.UserResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid user ID"))
	}

	user, err := h.userService.GetUserByID(ctx, uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.NotFoundResponse(c, userErrs.ErrUserNotFound)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "User retrieved successfully")
}

// CreateUser creates a new user
// @Summary Create a new user
// @Description Create a new user (admin endpoint)
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.CreateUserRequest true "User details"
// @Success 201 {object} response.UserResponse
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /users [post]
func (h *UserHandler) CreateUser(c *echo.Context) error {
	ctx := c.Request().Context()

	req := new(request.CreateUserRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}

	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, userErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	user := entity.NewUser(req.FirstName, req.LastName, req.Username, req.Email, req.Password)
	err := h.userService.CreateUser(ctx, user)
	if err != nil {
		if err == service.ErrEmailAlreadyUsed {
			return h.r.ConflictResponse(c, userErrs.ErrEmailAlreadyUsed)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	// event bus publish
	h.event.Publish(bus.Event{Type: "user.created", Payload: user})

	return h.r.CreatedResponse(c, response.FromEntity(user), "User created successfully")
}

// UpdateUser updates a user
// @Summary Update a user
// @Description Update user details by ID
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Param request body request.UpdateUserRequest true "Updated user details"
// @Success 200 {object} response.UserResponse
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [put]
func (h *UserHandler) UpdateUser(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid user ID"))
	}

	req := new(request.UpdateUserRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}

	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, userErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	user, err := h.userService.GetUserByID(ctx, uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.NotFoundResponse(c, userErrs.ErrUserNotFound)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	user.FirstName = req.FirstName
	user.LastName = req.LastName
	user.Email = req.Email
	user.Avatar = req.Avatar
	if req.Password != "" {
		user.Password = req.Password
	}

	err = h.userService.UpdateUser(ctx, user)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "User updated successfully")
}

// DeleteUser deletes a user
// @Summary Delete a user
// @Description Delete a user by ID
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "User ID"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/{id} [delete]
func (h *UserHandler) DeleteUser(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid user ID"))
	}

	err = h.userService.DeleteUser(ctx, uint(id))
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.NotFoundResponse(c, userErrs.ErrUserNotFound)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.NoContentResponse(c)
}

// GetUserProfile returns public user profile
// @Summary Get user profile by username
// @Tags users
// @Accept json
// @Produce json
// @Param username path string true "Username"
// @Success 200 {object} response.UserResponse
// @Router /u/{username} [get]
func (h *UserHandler) GetUserProfile(c *echo.Context) error {
	ctx := c.Request().Context()
	username := c.Param("username")

	user, err := h.userService.GetUserByUsername(ctx, username)
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.NotFoundResponse(c, userErrs.ErrUserNotFound)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "Profile retrieved successfully")
}

// GetStats returns global platform statistics (admin)
func (h *UserHandler) GetStats(c *echo.Context) error {
	ctx := c.Request().Context()

	var totalUsers int64
	_ = database.DB.WithContext(ctx).Table(database.T("users")).Where("deleted_at IS NULL").Count(&totalUsers).Error

	var totalPlans int64
	_ = database.DB.WithContext(ctx).Table(database.T("plans")).Where("deleted_at IS NULL").Count(&totalPlans).Error

	var totalOrders int64
	var totalRevenue int64
	type orderAgg struct {
		Count   int64
		Revenue int64
	}
	var agg orderAgg
	_ = database.DB.WithContext(ctx).Table(database.T("orders")).
		Select("COUNT(*) as count, COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as revenue").
		Scan(&agg).Error
	totalOrders = agg.Count
	totalRevenue = agg.Revenue

	var activeContainers int64
	_ = database.DB.WithContext(ctx).Table(database.T("containers")).
		Where("status = ? AND deleted_at IS NULL", "running").
		Count(&activeContainers).Error

	stats := map[string]interface{}{
		"total_revenue":     totalRevenue,
		"active_containers": activeContainers,
		"total_orders":      totalOrders,
		"total_plans":       totalPlans,
		"total_users":       totalUsers,
	}

	return h.r.SuccessResponse(c, stats, "Platform statistics retrieved successfully")
}

// GetAuditLogs returns audit logs (admin)
func (h *UserHandler) GetAuditLogs(c *echo.Context) error {
	ctx := c.Request().Context()

	var logs []audit.AuditLog
	result := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Limit(100).
		Find(&logs)
	if result.Error != nil {
		return h.r.InternalServerErrorResponse(c, result.Error)
	}

	return h.r.SuccessResponse(c, logs, "Audit logs retrieved successfully")
}

// RegisterRoutes registers the user routes
func (h *UserHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	// Public routes
	pub := e.Group(basePath)
	pub.GET("/u/:username", h.GetUserProfile)

	// Admin platform stats & audit routes
	adminGroup := e.Group(basePath, middleware.RequireAdmin)
	adminGroup.GET("/stats", h.GetStats)
	adminGroup.GET("/audit-logs", h.GetAuditLogs)

	// Auth routes
	group := e.Group(basePath+"/users", middleware.Auth)

	group.GET("", h.GetAllUsers)
	group.GET("/:id", h.GetUser)
	group.POST("", h.CreateUser)
	group.PUT("/:id", h.UpdateUser)
	group.DELETE("/:id", h.DeleteUser)
}
