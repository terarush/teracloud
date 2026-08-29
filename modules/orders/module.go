// File: modules/orders/module.go
package orders

import (
	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/midtrans"
	"ruang-tukar/modules/orders/domain/repository"
	"ruang-tukar/modules/orders/domain/service"
	"ruang-tukar/modules/orders/handler"
	planRepo "ruang-tukar/modules/plans/domain/repository"
	planService "ruang-tukar/modules/plans/domain/service"
	userRepo "ruang-tukar/modules/users/domain/repository"
	userService "ruang-tukar/modules/users/domain/service"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type Module struct {
	db             *gorm.DB
	logger         *logger.Logger
	orderService   *service.OrderService
	orderHandler   *handler.OrderHandler
	webhookHandler *handler.WebhookHandler
	event          *bus.EventBus
}

func (m *Module) Name() string {
	return "orders"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	orderRepository := repository.NewOrderRepositoryImpl()
	pRepo := planRepo.NewPlanRepositoryImpl()
	pService := planService.NewPlanService(pRepo)
	uRepo := userRepo.NewUserRepositoryImpl()
	uService := userService.NewUserService(uRepo)
	midtransClient := midtrans.NewClient()

	m.orderService = service.NewOrderService(orderRepository, pService, uService, midtransClient, m.event)
	m.orderHandler = handler.NewOrderHandler(m.logger, m.event, m.orderService)
	m.webhookHandler = handler.NewWebhookHandler(m.logger, m.orderService)

	m.logger.Info("Orders module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.orderHandler.RegisterRoutes(e, basePath)
	m.webhookHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	return nil
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

func (m *Module) GetService() *service.OrderService {
	return m.orderService
}

func NewModule() *Module {
	return &Module{}
}
