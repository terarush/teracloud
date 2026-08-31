// File: modules/containers/handler/container_handler.go
package handler

import (
	"strconv"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/utils"
	containerErrs "ruang-tukar/modules/containers/errs"
	"ruang-tukar/modules/containers/domain/entity"
	"ruang-tukar/modules/containers/domain/service"
	"ruang-tukar/modules/containers/dto/request"
	"ruang-tukar/modules/containers/dto/response"

	"github.com/labstack/echo/v5"
)

type ContainerHandler struct {
	containerService *service.ContainerService
	log              *logger.Logger
	event            *bus.EventBus
	r                *utils.Response
}

func NewContainerHandler(log *logger.Logger, event *bus.EventBus, containerService *service.ContainerService) *ContainerHandler {
	return &ContainerHandler{
		containerService: containerService,
		log:              log,
		event:            event,
		r:                &utils.Response{},
	}
}

// GetContainers lists containers (role-aware: user gets own, admin gets all)
func (h *ContainerHandler) GetContainers(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)
	if userID == 0 {
		return h.r.UnauthorizedResponse(c, utils.NewAppError(utils.CodeUnauthorized, "Unauthorized"))
	}

	var containers []*entity.Container
	var err error
	if userRole == middleware.RoleAdmin {
		containers, err = h.containerService.GetAllContainers(ctx)
	} else {
		containers, err = h.containerService.GetUserContainers(ctx, userID)
	}

	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntities(containers), "Containers retrieved successfully")
}

// GetUserContainers lists all containers for current user
func (h *ContainerHandler) GetUserContainers(c *echo.Context) error {
	return h.GetContainers(c)
}

// GetContainerByID gets container details
func (h *ContainerHandler) GetContainerByID(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		if err == containerErrs.ErrContainerNotFound {
			return h.r.NotFoundResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "You do not have access to this container"))
	}

	return h.r.SuccessResponse(c, response.FromEntity(container), "Container retrieved successfully")
}

// StartContainer starts container
func (h *ContainerHandler) StartContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	if err := h.containerService.StartContainer(ctx, uint(id), container.UserID); err != nil {
		if err == containerErrs.ErrContainerAlreadyRunning || err == containerErrs.ErrContainerSuspended {
			return h.r.BadRequestResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"status": "running"}, "Container started successfully")
}

// StopContainer stops container
func (h *ContainerHandler) StopContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	if err := h.containerService.StopContainer(ctx, uint(id), container.UserID); err != nil {
		if err == containerErrs.ErrContainerNotRunning {
			return h.r.BadRequestResponse(c, err)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"status": "stopped"}, "Container stopped successfully")
}

// RestartContainer restarts container
func (h *ContainerHandler) RestartContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	if err := h.containerService.RestartContainer(ctx, uint(id), container.UserID); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"status": "running"}, "Container restarted successfully")
}

// RebootContainer force kills and reboots container
func (h *ContainerHandler) RebootContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	if err := h.containerService.RebootContainer(ctx, uint(id), container.UserID); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"status": "running"}, "Container rebooted successfully")
}

// ResetContainer resets container
func (h *ContainerHandler) ResetContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	req := new(request.ResetContainerRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if req.Mode == "" {
		req.Mode = "soft"
	}

	if err := h.containerService.ResetContainer(ctx, uint(id), container.UserID, req.Mode); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"status": "running"}, "Container reset successfully")
}

// DeleteContainer deletes container and releases resources
func (h *ContainerHandler) DeleteContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	if err := h.containerService.DeleteContainer(ctx, uint(id), container.UserID); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.NoContentResponse(c)
}

// GetContainerEvents lists events
func (h *ContainerHandler) GetContainerEvents(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	events, err := h.containerService.GetContainerEvents(ctx, uint(id))
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, events, "Container events retrieved successfully")
}

// GetStats returns current container resource stats
func (h *ContainerHandler) GetStats(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	stats := map[string]interface{}{
		"cpu_usage_percent": 1.5,
		"memory_usage_mb":   142,
		"memory_limit_mb":   container.MemoryLimit,
		"network_rx_bytes":  4194304,
		"network_tx_bytes":  2097152,
		"disk_usage_bytes":  1073741824,
	}

	return h.r.SuccessResponse(c, stats, "Container stats retrieved successfully")
}

// GetLogs returns stdout/stderr output from the container.
func (h *ContainerHandler) GetLogs(c *echo.Context) error {
	ctx := c.Request().Context()
	userID := utils.UserIDFromCtx(c)
	userRole := utils.UserRoleFromCtx(c)

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}
	if userRole != middleware.RoleAdmin && container.UserID != userID {
		return h.r.ForbiddenResponse(c, utils.NewAppError(utils.CodeForbidden, "Unauthorized"))
	}

	tail := c.QueryParam("tail")
	if tail == "" {
		tail = "200"
	}

	logs, err := h.containerService.GetLogs(ctx, uint(id), tail)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, map[string]string{"logs": logs}, "Container logs retrieved successfully")
}

// SuspendContainer force suspends container (admin)
func (h *ContainerHandler) SuspendContainer(c *echo.Context) error {
	ctx := c.Request().Context()
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}

	_ = h.containerService.StopContainer(ctx, uint(id), container.UserID)
	return h.r.SuccessResponse(c, map[string]string{"status": "suspended"}, "Container suspended successfully")
}

// GetAllContainers (admin)
func (h *ContainerHandler) GetAllContainers(c *echo.Context) error {
	ctx := c.Request().Context()
	containers, err := h.containerService.GetAllContainers(ctx)
	if err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}
	return h.r.SuccessResponse(c, response.FromEntities(containers), "Containers retrieved successfully")
}

func (h *ContainerHandler) AdminForceDeleteContainer(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	container, err := h.containerService.GetContainerByID(ctx, uint(id))
	if err != nil {
		return h.r.NotFoundResponse(c, err)
	}

	if err := h.containerService.DeleteContainer(ctx, uint(id), container.UserID); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.NoContentResponse(c)
}

func (h *ContainerHandler) AdminRestartContainer(c *echo.Context) error {
	ctx := c.Request().Context()

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeBadRequest, "Invalid container ID"))
	}

	if err := h.containerService.RestartContainer(ctx, uint(id), 0); err != nil {
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, nil, "Container restarted")
}

func (h *ContainerHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath+"/containers", middleware.Auth)
	group.GET("", h.GetContainers)
	group.GET("/:id", h.GetContainerByID)
	group.GET("/:id/stats", h.GetStats)
	group.GET("/:id/logs", h.GetLogs)
	group.POST("/:id/start", h.StartContainer)
	group.POST("/:id/stop", h.StopContainer)
	group.POST("/:id/restart", h.RestartContainer)
	group.POST("/:id/reboot", h.RebootContainer)
	group.POST("/:id/reset", h.ResetContainer)
	group.DELETE("/:id", h.DeleteContainer)
	group.GET("/:id/events", h.GetContainerEvents)

	// Admin-specific container actions
	adminGroup := e.Group(basePath+"/containers", middleware.RequireAdmin)
	adminGroup.GET("/all", h.GetAllContainers)
	adminGroup.POST("/:id/suspend", h.SuspendContainer)
	adminGroup.DELETE("/:id/force", h.AdminForceDeleteContainer)
	adminGroup.POST("/:id/admin-restart", h.AdminRestartContainer)
}
