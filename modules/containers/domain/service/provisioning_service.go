// File: modules/containers/domain/service/provisioning_service.go
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/docker"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/portmanager"
	"ruang-tukar/modules/containers/domain/entity"
	"ruang-tukar/modules/containers/domain/repository"
	planRepo "ruang-tukar/modules/plans/domain/repository"

	"gorm.io/gorm"
)

type ProvisioningService struct {
	containerRepo repository.ContainerRepository
	eventRepo     repository.EventRepository
	planRepo      planRepo.PlanRepository
	dockerClient  *docker.Client
	portManager   *portmanager.Manager
	log           *logger.Logger
	event         *bus.EventBus
	db            *gorm.DB
}

func NewProvisioningService(
	containerRepo repository.ContainerRepository,
	eventRepo repository.EventRepository,
	planRepo planRepo.PlanRepository,
	dockerClient *docker.Client,
	portManager *portmanager.Manager,
	log *logger.Logger,
	event *bus.EventBus,
	db *gorm.DB,
) *ProvisioningService {
	return &ProvisioningService{
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

// ProvisionContainer runs the full creation pipeline for a container asynchronously.
func (s *ProvisioningService) ProvisionContainer(ctx context.Context, userID, subscriptionID, planID uint) error {
	plan, err := s.planRepo.FindByID(ctx, planID)
	if err != nil {
		return fmt.Errorf("plan not found: %w", err)
	}

	// 1. Generate unique container name and hostname
	randomHex := make([]byte, 3)
	_, _ = rand.Read(randomHex)
	containerName := fmt.Sprintf("tc-%d-%s", userID, hex.EncodeToString(randomHex))
	hostname := containerName

	// 2. Initial container record in DB
	containerRecord := &entity.Container{
		UserID:            userID,
		SubscriptionID:    subscriptionID,
		PlanID:            planID,
		ContainerName:     containerName,
		Hostname:          hostname,
		ImageName:         plan.ImageName,
		ImageTag:          plan.ImageTag,
		Status:            "creating",
		CPULimit:          plan.CPULimit,
		MemoryLimit:       plan.MemoryLimit,
		DiskLimit:         plan.DiskLimit,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := s.containerRepo.Create(ctx, containerRecord); err != nil {
		return fmt.Errorf("failed to create initial container record: %w", err)
	}

	// 3. Create persistent volume path: /var/lib/teracloud/volumes/{user_id}/{container_id}/data
	volumeBase := os.Getenv("DOCKER_VOLUME_BASE")
	if volumeBase == "" {
		volumeBase = "/var/lib/teracloud/volumes"
	}
	volumePath := fmt.Sprintf("%s/%d/%d/data", volumeBase, userID, containerRecord.ID)
	_ = os.MkdirAll(volumePath, 0750)
	containerRecord.VolumePath = volumePath

	// 4. Allocate ports (SSH: 22, HTTP: 80)
	sshPort, err := s.portManager.Allocate(s.db, containerRecord.ID, 22, "SSH")
	if err != nil {
		s.log.Error("Port allocation error for SSH: %v", err)
	}
	httpPort, err := s.portManager.Allocate(s.db, containerRecord.ID, 80, "HTTP")
	if err != nil {
		s.log.Error("Port allocation error for HTTP: %v", err)
	}

	portMap := make(map[int]int)
	assignedMap := make(map[string]int)
	if sshPort > 0 {
		portMap[22] = sshPort
		assignedMap["ssh"] = sshPort
	}
	if httpPort > 0 {
		portMap[80] = httpPort
		assignedMap["http"] = httpPort
	}

	portMapBytes, _ := json.Marshal(portMap)
	assignedBytes, _ := json.Marshal(assignedMap)
	containerRecord.PortMappings = portMapBytes
	containerRecord.AssignedPorts = assignedBytes

	// 5. Pull Docker image
	s.log.Info("Pulling image %s:%s for container %s", plan.ImageName, plan.ImageTag, containerName)
	if err := s.dockerClient.PullImage(ctx, plan.ImageName, plan.ImageTag); err != nil {
		s.log.Warn("Image pull warning: %v (trying to proceed with local image)", err)
	}

	// 6. Create & Start Docker Container
	dockerID, err := s.dockerClient.CreateAndStartContainer(ctx, docker.ContainerConfig{
		Name:          containerName,
		ImageName:     plan.ImageName,
		ImageTag:      plan.ImageTag,
		Hostname:      hostname,
		CPULimit:      plan.CPULimit,
		MemoryLimitMB: plan.MemoryLimit,
		VolumePath:    volumePath,
		PortMappings:  portMap,
	})

	if err != nil {
		s.log.Error("Failed to create docker container %s: %v", containerName, err)
		containerRecord.Status = "error"
		containerRecord.ErrorMessage = err.Error()
		_ = s.containerRepo.Update(ctx, containerRecord)
		return err
	}

	now := time.Now()
	containerRecord.DockerContainerID = dockerID
	containerRecord.Status = "running"
	containerRecord.LastStartedAt = &now
	containerRecord.ErrorMessage = ""
	containerRecord.UpdatedAt = now

	if err := s.containerRepo.Update(ctx, containerRecord); err != nil {
		return err
	}

	// 7. Record container created event
	_ = s.eventRepo.Create(ctx, &entity.ContainerEvent{
		ContainerID: containerRecord.ID,
		UserID:      &userID,
		EventType:   "created",
		Description: fmt.Sprintf("Container %s successfully provisioned and started", containerName),
		CreatedAt:   time.Now(),
	})

	// 8. Publish event container.ready
	s.event.Publish(bus.Event{
		Type:    "container.ready",
		Payload: containerRecord,
	})

	s.log.Info("Container %s (ID: %d, Docker: %s) successfully provisioned", containerName, containerRecord.ID, dockerID)
	return nil
}
