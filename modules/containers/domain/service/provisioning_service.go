// File: modules/containers/domain/service/provisioning_service.go
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/bus"
	cloudflare "ruang-tukar/internal/pkg/cloudflare"
	"ruang-tukar/internal/pkg/docker"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/portmanager"
	"ruang-tukar/modules/containers/domain/entity"
	"ruang-tukar/modules/containers/domain/repository"
	planEntity "ruang-tukar/modules/plans/domain/entity"
	planRepo "ruang-tukar/modules/plans/domain/repository"

	"gorm.io/gorm"
)

type ProvisioningService struct {
	containerRepo    repository.ContainerRepository
	eventRepo        repository.EventRepository
	planRepo         planRepo.PlanRepository
	dockerClient     *docker.Client
	portManager      *portmanager.Manager
	log              *logger.Logger
	event            *bus.EventBus
	db               *gorm.DB
	cloudflareClient *cloudflare.Client
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
	cloudflareClient *cloudflare.Client,
) *ProvisioningService {
	return &ProvisioningService{
		containerRepo:    containerRepo,
		eventRepo:        eventRepo,
		planRepo:         planRepo,
		dockerClient:     dockerClient,
		portManager:      portManager,
		log:              log,
		event:            event,
		db:               db,
		cloudflareClient: cloudflareClient,
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
		UserID:         userID,
		SubscriptionID: subscriptionID,
		PlanID:         planID,
		ContainerName:  containerName,
		Hostname:       hostname,
		ImageName:      plan.ImageName,
		ImageTag:       plan.ImageTag,
		Status:         "creating",
		CPULimit:       plan.CPULimit,
		MemoryLimit:    plan.MemoryLimit,
		DiskLimit:      plan.DiskLimit,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
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
	_ = os.MkdirAll(volumePath, 0777)
	_ = os.Chmod(volumePath, 0777)
	containerRecord.VolumePath = volumePath

	// 4. Allocate ports based on Plan PortConfig
	var portConfigs []planEntity.PortConfigItem
	if len(plan.PortConfig) > 0 && string(plan.PortConfig) != "[]" && string(plan.PortConfig) != "null" {
		_ = json.Unmarshal(plan.PortConfig, &portConfigs)
	}

	// Fallback to default port 80 HTTP if no port configuration is defined on the plan
	if len(portConfigs) == 0 {
		portConfigs = []planEntity.PortConfigItem{
			{
				ContainerPort: 80,
				Protocol:      "tcp",
				Name:          "http",
				Description:   "Web Application Port",
				IsPrimary:     true,
			},
		}
	}

	portMap := make(map[int]int)
	assignedMap := make(map[string]int)

	for _, pc := range portConfigs {
		if pc.ContainerPort <= 0 {
			continue
		}
		desc := pc.Description
		if desc == "" {
			desc = pc.Name
		}
		hostPort, err := s.portManager.Allocate(s.db, containerRecord.ID, pc.ContainerPort, desc)
		if err != nil {
			s.log.Error("Port allocation error for %s (port %d): %v", pc.Name, pc.ContainerPort, err)
			continue
		}
		portMap[pc.ContainerPort] = hostPort
		key := pc.Name
		if key == "" {
			key = fmt.Sprintf("port_%d", pc.ContainerPort)
		}
		assignedMap[key] = hostPort
	}

	portMapBytes, _ := json.Marshal(portMap)
	assignedBytes, _ := json.Marshal(assignedMap)
	containerRecord.PortMappings = portMapBytes
	containerRecord.AssignedPorts = assignedBytes

	// 5. Pull Docker image
	s.log.Infof("Pulling image %s:%s for container %s", plan.ImageName, plan.ImageTag, containerName)
	if err := s.dockerClient.PullImage(ctx, plan.ImageName, plan.ImageTag); err != nil {
		s.log.Warnf("Image pull warning: %v (trying to proceed with local image)", err)
	}

	// 6. Create & Start Docker Container
	dockerCfg := docker.ContainerConfig{
		Name:          containerName,
		ImageName:     plan.ImageName,
		ImageTag:      plan.ImageTag,
		Hostname:      hostname,
		CPULimit:      plan.CPULimit,
		MemoryLimitMB: plan.MemoryLimit,
		VolumePath:    volumePath,
		PortMappings:  portMap,
	}

	if plan.Command != nil && *plan.Command != "" {
		dockerCfg.Command = strings.Fields(*plan.Command)
	}
	if plan.Entrypoint != nil && *plan.Entrypoint != "" {
		dockerCfg.Entrypoint = strings.Fields(*plan.Entrypoint)
	}

	dockerID, err := s.dockerClient.CreateAndStartContainer(ctx, dockerCfg)

	if err != nil {
		s.log.Errorf("Failed to create docker container %s: %v", containerName, err)
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

	// 9. Auto-configure Cloudflare Tunnel routes
	if s.cloudflareClient != nil && s.cloudflareClient.IsEnabled() {
		var routes []cloudflare.TunnelRoute
		containerHex := ""
		parts := strings.Split(containerName, "-")
		if len(parts) > 0 {
			containerHex = parts[len(parts)-1]
		}

		for _, pc := range portConfigs {
			if pc.ContainerPort <= 0 {
				continue
			}

			key := pc.Name
			if key == "" {
				key = fmt.Sprintf("port_%d", pc.ContainerPort)
			}

			if hostPort, ok := assignedMap[key]; ok {
				subdomain := fmt.Sprintf("%s-%s", containerHex, key)
				domain := os.Getenv("TUNNEL_DOMAIN")
				if domain == "" {
					panic("TUNNEL_DOMAIN is missingg")
				}
				url := fmt.Sprintf("https://%s.%s", subdomain, domain)

				routes = append(routes, cloudflare.TunnelRoute{
					Subdomain: subdomain,
					HostPort:  hostPort,
					Name:      key,
					URL:       url,
				})
			}
		}

		if len(routes) > 0 {
			err := s.cloudflareClient.AddRoutes(ctx, routes)
			if err != nil {
				s.log.Errorf("Failed to add Cloudflare routes for container %s: %v", containerName, err)
			} else {
				routesJSON, _ := json.Marshal(routes)
				containerRecord.TunnelRoutes = routesJSON
				_ = s.containerRepo.Update(ctx, containerRecord)
			}
		}
	}

	s.log.Infof("Container %s (ID: %d, Docker: %s) successfully provisioned", containerName, containerRecord.ID, dockerID)
	return nil
}

func (s *ProvisioningService) CleanupTunnelRoutes(ctx context.Context, container *entity.Container) error {
	if s.cloudflareClient == nil || !s.cloudflareClient.IsEnabled() {
		return nil
	}

	if container.TunnelRoutes == nil || string(container.TunnelRoutes) == "[]" || string(container.TunnelRoutes) == "null" {
		return nil
	}

	var routes []cloudflare.TunnelRoute
	if err := json.Unmarshal(container.TunnelRoutes, &routes); err != nil {
		return err
	}

	var subdomains []string
	for _, r := range routes {
		subdomains = append(subdomains, r.Subdomain)
	}

	if len(subdomains) > 0 {
		if err := s.cloudflareClient.RemoveRoutes(ctx, subdomains); err != nil {
			s.log.Errorf("Failed to cleanup Cloudflare routes for container %d: %v", container.ID, err)
			return err
		}
	}

	return nil
}
