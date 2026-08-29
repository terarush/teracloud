// File: modules/plans/module.go
package plans

import (
	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/modules/plans/domain/repository"
	"ruang-tukar/modules/plans/domain/service"
	"ruang-tukar/modules/plans/handler"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type Module struct {
	db          *gorm.DB
	logger      *logger.Logger
	planService *service.PlanService
	planHandler *handler.PlanHandler
	event       *bus.EventBus
}

func (m *Module) Name() string {
	return "plans"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	planRepo := repository.NewPlanRepositoryImpl()
	m.planService = service.NewPlanService(planRepo)
	m.planHandler = handler.NewPlanHandler(m.logger, m.event, m.planService)

	m.logger.Info("Plans module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.planHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	// Schema managed by SQL migrations, not AutoMigrate
	return nil
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// GetService returns the plan service for other modules
func (m *Module) GetService() *service.PlanService {
	return m.planService
}

func NewModule() *Module {
	return &Module{}
}
