// File: modules/containers/domain/service/container_service.go
package service

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/audit"
	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/docker"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/portmanager"
	containerErrs "ruang-tukar/modules/containers/errs"
	"ruang-tukar/modules/containers/domain/entity"
	"ruang-tukar/modules/containers/domain/repository"
	planRepo "ruang-tukar/modules/plans/domain/repository"

	"gorm.io/gorm"
)

type ContainerService struct {
	containerRepo repository.ContainerRepository
	eventRepo     repository.EventRepository
	planRepo      planRepo.PlanRepository
	dockerClient  *docker.Client
	portManager   *portmanager.Manager
	log           *logger.Logger
	event         *bus.EventBus
	db            *gorm.DB
}

func NewContainerService(
	containerRepo repository.ContainerRepository,
	eventRepo repository.EventRepository,
	planRepo planRepo.PlanRepository,
	dockerClient *docker.Client,
	portManager *portmanager.Manager,
	log *logger.Logger,
	event *bus.EventBus,
	db *gorm.DB,
) *ContainerService {
	return &ContainerService{
		containerRepo: containerRepo,
		eventRepo:     eventRepo,
		planRepo:      planRepo,
		dockerClient:  dockerClient,
		portManager:   portManager,
		log:           log,
		event:         event,
		db:            db,
	}
}

func (s *ContainerService) GetContainerByID(ctx context.Context, id uint) (*entity.Container, error) {
	container, err := s.containerRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, containerErrs.ErrContainerNotFound
		}
		return nil, err
	}
	return container, nil
}

func (s *ContainerService) GetUserContainers(ctx context.Context, userID uint) ([]*entity.Container, error) {
	return s.containerRepo.FindByUserID(ctx, userID)
}

func (s *ContainerService) GetAllContainers(ctx context.Context) ([]*entity.Container, error) {
	return s.containerRepo.FindAll(ctx)
}

func (s *ContainerService) GetContainerEvents(ctx context.Context, containerID uint) ([]*entity.ContainerEvent, error) {
	return s.eventRepo.FindByContainerID(ctx, containerID)
}

// StartContainer starts a stopped container.
func (s *ContainerService) StartContainer(ctx context.Context, id, userID uint) error {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return err
	}
	if c.Status == "running" {
		return containerErrs.ErrContainerAlreadyRunning
	}
	if c.Status == "suspended" {
		return containerErrs.ErrContainerSuspended
	}

	if err := s.dockerClient.StartContainer(ctx, c.DockerContainerID); err != nil {
		return fmt.Errorf("docker start failed: %w", err)
	}

	now := time.Now()
	c.Status = "running"
	c.LastStartedAt = &now
	c.UpdatedAt = now
	_ = s.containerRepo.Update(ctx, c)

	s.recordAction(ctx, c, &userID, "started", "Container started by user")
	return nil
}

// StopContainer gracefully stops a running container.
func (s *ContainerService) StopContainer(ctx context.Context, id, userID uint) error {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return err
	}
	if c.Status == "stopped" {
		return nil
	}

	if c.DockerContainerID != "" {
		if err := s.dockerClient.StopContainer(ctx, c.DockerContainerID); err != nil {
			s.log.Warnf("Docker stop warning for container %s: %v", c.DockerContainerID, err)
		}
	}

	now := time.Now()
	c.Status = "stopped"
	c.LastStoppedAt = &now
	c.UpdatedAt = now
	_ = s.containerRepo.Update(ctx, c)

	s.recordAction(ctx, c, &userID, "stopped", "Container stopped by user")
	return nil
}

// RestartContainer restarts a running container.
func (s *ContainerService) RestartContainer(ctx context.Context, id, userID uint) error {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return err
	}
	if c.Status == "suspended" {
		return containerErrs.ErrContainerSuspended
	}

	if err := s.dockerClient.RestartContainer(ctx, c.DockerContainerID); err != nil {
		return fmt.Errorf("docker restart failed: %w", err)
	}

	now := time.Now()
	c.Status = "running"
	c.LastStartedAt = &now
	c.UpdatedAt = now
	_ = s.containerRepo.Update(ctx, c)

	s.recordAction(ctx, c, &userID, "restarted", "Container restarted by user")
	return nil
}

// RebootContainer force kills and starts a container.
func (s *ContainerService) RebootContainer(ctx context.Context, id, userID uint) error {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return err
	}
	if c.Status == "suspended" {
		return containerErrs.ErrContainerSuspended
	}

	_ = s.dockerClient.KillContainer(ctx, c.DockerContainerID)
	if err := s.dockerClient.StartContainer(ctx, c.DockerContainerID); err != nil {
		return fmt.Errorf("docker reboot start failed: %w", err)
	}

	now := time.Now()
	c.Status = "running"
	c.LastStartedAt = &now
	c.UpdatedAt = now
	_ = s.containerRepo.Update(ctx, c)

	s.recordAction(ctx, c, &userID, "rebooted", "Container rebooted (force kill & start)")
	return nil
}

// ResetContainer resets container. Mode: "soft" (preserves volume) or "hard" (wipes volume).
func (s *ContainerService) ResetContainer(ctx context.Context, id, userID uint, mode string) error {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return err
	}

	// 1. Stop and remove old docker container
	if c.DockerContainerID != "" {
		_ = s.dockerClient.StopContainer(ctx, c.DockerContainerID)
		_ = s.dockerClient.RemoveContainer(ctx, c.DockerContainerID)
	}

	// 2. If hard reset, wipe volume directory
	if mode == "hard" && c.VolumePath != "" {
		_ = os.RemoveAll(c.VolumePath)
		_ = os.MkdirAll(c.VolumePath, 0750)
	}

	// 3. Re-create and start container with same config
	var portMap map[int]int
	_ = json.Unmarshal(c.PortMappings, &portMap)

	dockerCfg := docker.ContainerConfig{
		Name:          c.ContainerName,
		ImageName:     c.ImageName,
		ImageTag:      c.ImageTag,
		Hostname:      c.Hostname,
		CPULimit:      c.CPULimit,
		MemoryLimitMB: c.MemoryLimit,
		VolumePath:    c.VolumePath,
		PortMappings:  portMap,
	}

	plan, err := s.planRepo.FindByID(ctx, c.PlanID)
	if err == nil && plan != nil {
		if plan.Command != nil && *plan.Command != "" {
			dockerCfg.Command = strings.Fields(*plan.Command)
		}
		if plan.Entrypoint != nil && *plan.Entrypoint != "" {
			dockerCfg.Entrypoint = strings.Fields(*plan.Entrypoint)
		}
	}

	dockerID, err := s.dockerClient.CreateAndStartContainer(ctx, dockerCfg)
	if err != nil {
		c.Status = "error"
		c.ErrorMessage = err.Error()
		_ = s.containerRepo.Update(ctx, c)
		return err
	}

	now := time.Now()
	c.DockerContainerID = dockerID
	c.Status = "running"
	c.LastStartedAt = &now
	c.ErrorMessage = ""
	c.UpdatedAt = now
	_ = s.containerRepo.Update(ctx, c)

	s.recordAction(ctx, c, &userID, "reset_"+mode, fmt.Sprintf("Container reset (%s mode)", mode))
	return nil
}

// DeleteContainer destroys container, volume, and releases ports.
func (s *ContainerService) DeleteContainer(ctx context.Context, id, userID uint) error {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return err
	}

	// Stop and remove docker container
	_ = s.dockerClient.RemoveContainer(ctx, c.DockerContainerID)

	// Remove volume directory
	if c.VolumePath != "" {
		_ = os.RemoveAll(c.VolumePath)
	}

	// Release ports
	_ = s.portManager.Release(s.db, c.ID)

	// Soft delete record
	_ = s.containerRepo.SoftDelete(ctx, c.ID)

	s.recordAction(ctx, c, &userID, "deleted", "Container deleted and storage removed")
	return nil
}

// GetLogs retrieves stdout/stderr logs from the docker container.
func (s *ContainerService) GetLogs(ctx context.Context, id uint, tail string) (string, error) {
	c, err := s.GetContainerByID(ctx, id)
	if err != nil {
		return "", err
	}
	if c.DockerContainerID == "" {
		return "", fmt.Errorf("container has no active docker instance")
	}

	return s.dockerClient.GetContainerLogs(ctx, c.DockerContainerID, tail)
}

func (s *ContainerService) recordAction(ctx context.Context, c *entity.Container, userID *uint, eventType, description string) {
	_ = s.eventRepo.Create(ctx, &entity.ContainerEvent{
		ContainerID: c.ID,
		UserID:      userID,
		EventType:   eventType,
		Description: description,
		CreatedAt:   time.Now(),
	})

	audit.LogAsync(audit.Params{
		UserID:     userID,
		ActorType:  "user",
		SchemaName: "hosting",
		TableName:  "containers",
		RecordID:   c.ID,
		Action:     "container_" + eventType,
		Summary:    description + ": " + c.ContainerName,
		Module:     "containers",
	})
}
