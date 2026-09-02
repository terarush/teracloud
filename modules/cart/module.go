// File: modules/cart/module.go
package cart

import (
	"teracloud/internal/pkg/bus"
	"teracloud/internal/pkg/logger"
	"teracloud/internal/pkg/middleware"
	"teracloud/modules/cart/domain/repository"
	"teracloud/modules/cart/domain/service"
	"teracloud/modules/cart/handler"
	planRepository "teracloud/modules/plans/domain/repository"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type Module struct {
	db          *gorm.DB
	logger      *logger.Logger
	cartService *service.CartService
	cartHandler *handler.CartHandler
	event       *bus.EventBus
}

func (m *Module) Name() string {
	return "cart"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	cartRepo := repository.NewCartRepository()
	planRepo := planRepository.NewPlanRepositoryImpl()
	m.cartService = service.NewCartService(cartRepo, planRepo)
	m.cartHandler = handler.NewCartHandler(m.logger, m.cartService)

	m.logger.Info("Cart module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	cartGroup := e.Group(basePath+"/cart", middleware.Auth)
	cartGroup.GET("", m.cartHandler.GetCart)
	cartGroup.POST("", m.cartHandler.AddToCart)
	cartGroup.PUT("/:id", m.cartHandler.UpdateCartItem)
	cartGroup.DELETE("/:id", m.cartHandler.RemoveFromCart)
	cartGroup.DELETE("", m.cartHandler.ClearCart)
}

func (m *Module) Migrations() error {
	return nil
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

func (m *Module) GetService() *service.CartService {
	return m.cartService
}

func NewModule() *Module {
	return &Module{}
}
