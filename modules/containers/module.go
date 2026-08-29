// File: modules/containers/module.go
package containers

import (
	"context"
	"os"
	"strconv"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/docker"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/portmanager"
	billingRepo "ruang-tukar/modules/billing/domain/repository"
	billingService "ruang-tukar/modules/billing/domain/service"
	"ruang-tukar/modules/containers/domain/repository"
	"ruang-tukar/modules/containers/domain/service"
	"ruang-tukar/modules/containers/handler"
	orderEntity "ruang-tukar/modules/orders/domain/entity"
	planRepo "ruang-tukar/modules/plans/domain/repository"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type Module struct {
	db                  *gorm.DB
	logger              *logger.Logger
	containerService    *service.ContainerService
	provisioningService *service.ProvisioningService
	containerHandler    *handler.ContainerHandler
	terminalHandler     *handler.TerminalHandler
	dockerClient        *docker.Client
	event               *bus.EventBus
}

func (m *Module) Name() string {
	return "containers"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	// Docker Client
	dockerCli, err := docker.NewClient()
	if err != nil {
		m.logger.Warn("Docker client initialization warning: %v", err)
	}
	m.dockerClient = dockerCli

	// Port Manager
	pStart, _ := strconv.Atoi(os.Getenv("DOCKER_PORT_RANGE_START"))
	if pStart == 0 {
		pStart = 10000
	}
	pEnd, _ := strconv.Atoi(os.Getenv("DOCKER_PORT_RANGE_END"))
	if pEnd == 0 {
		pEnd = 60000
	}
	portMgr := portmanager.New(pStart, pEnd)

	// Repositories
	containerRepo := repository.NewContainerRepositoryImpl()
	eventRepo := repository.NewEventRepositoryImpl()
	pRepo := planRepo.NewPlanRepositoryImpl()
	subRepo := billingRepo.NewSubscriptionRepositoryImpl()
	subService := billingService.NewSubscriptionService(subRepo)

	// Services
	m.containerService = service.NewContainerService(
		containerRepo, eventRepo, pRepo, m.dockerClient, portMgr, m.logger, m.event, m.db,
	)
	m.provisioningService = service.NewProvisioningService(
		containerRepo, eventRepo, pRepo, m.dockerClient, portMgr, m.logger, m.event, m.db,
	)

	// Handlers
	m.containerHandler = handler.NewContainerHandler(m.logger, m.event, m.containerService)
	m.terminalHandler = handler.NewTerminalHandler(m.logger, m.containerService, m.dockerClient)

	// Event listener: order.paid -> triggers container provisioning
	m.event.SubscribeFunc("order.paid", func(ev bus.Event) {
		if order, ok := ev.Payload.(*orderEntity.Order); ok {
			m.logger.Infof("Received order.paid event for order %s, provisioning containers...", order.OrderNumber)
			go func() {
				ctx := context.Background()
				if len(order.Items) > 0 {
					for _, item := range order.Items {
						sub, err := subService.EnsureSubscription(ctx, order.UserID, item.PlanID, order.ID)
						if err != nil {
							m.logger.Errorf("Failed to ensure subscription for order %s, plan %d: %v", order.OrderNumber, item.PlanID, err)
							continue
						}
						if err := m.provisioningService.ProvisionContainer(ctx, order.UserID, sub.ID, item.PlanID); err != nil {
							m.logger.Errorf("Failed to provision container for order %s, plan %d: %v", order.OrderNumber, item.PlanID, err)
						}
					}
				} else if order.PlanID != nil {
					sub, err := subService.EnsureSubscription(ctx, order.UserID, *order.PlanID, order.ID)
					if err != nil {
						m.logger.Errorf("Failed to ensure subscription for order %s, plan %d: %v", order.OrderNumber, *order.PlanID, err)
						return
					}
					if err := m.provisioningService.ProvisionContainer(ctx, order.UserID, sub.ID, *order.PlanID); err != nil {
						m.logger.Errorf("Failed to provision container for order %s, plan %d: %v", order.OrderNumber, *order.PlanID, err)
					}
				}
			}()
		}
	})

	m.logger.Info("Containers module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.containerHandler.RegisterRoutes(e, basePath)
	m.terminalHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	return nil
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

func (m *Module) GetService() *service.ContainerService {
	return m.containerService
}

func (m *Module) GetProvisioningService() *service.ProvisioningService {
	return m.provisioningService
}

func NewModule() *Module {
	return &Module{}
}
