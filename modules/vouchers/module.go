// File: modules/vouchers/module.go
package vouchers

import (
	"teracloud/internal/pkg/bus"
	"teracloud/internal/pkg/logger"
	"teracloud/modules/vouchers/domain/repository"
	"teracloud/modules/vouchers/domain/service"
	"teracloud/modules/vouchers/handler"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type Module struct {
	db             *gorm.DB
	logger         *logger.Logger
	voucherService *service.VoucherService
	voucherHandler *handler.VoucherHandler
	event          *bus.EventBus
}

// defaultService holds the initialized voucher service so other modules
// (e.g. orders) can resolve it during their own Initialize. Mirrors the
// pattern of other shared singletons in this codebase.
var defaultService *service.VoucherService

// Service returns the package-level voucher service (nil until the module initializes).
func Service() *service.VoucherService {
	return defaultService
}

func (m *Module) Name() string {
	return "vouchers"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	voucherRepo := repository.NewVoucherRepositoryImpl()
	m.voucherService = service.NewVoucherService(voucherRepo, m.event)
	m.voucherHandler = handler.NewVoucherHandler(m.logger, m.voucherService)

	defaultService = m.voucherService

	m.logger.Info("Vouchers module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.voucherHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	// Schema managed by SQL migrations, not AutoMigrate
	return nil
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

// GetService returns the voucher service for other modules.
func (m *Module) GetService() *service.VoucherService {
	return m.voucherService
}

func NewModule() *Module {
	return &Module{}
}
