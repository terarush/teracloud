package app

import (
	"fmt"
	"teracloud/internal/pkg/bus"
	"teracloud/internal/pkg/config"
	"teracloud/internal/pkg/database"
	"teracloud/internal/pkg/logger"
	"teracloud/internal/pkg/migrate"
	"teracloud/internal/pkg/server"
	"teracloud/internal/pkg/storage"
	_validator "teracloud/internal/pkg/validator"
	"time"

	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
	"gorm.io/gorm"
)

// App represents the application
type App struct {
	db      *gorm.DB
	server  *server.ServerContext
	modules []Module
	r       *echo.Echo
	logger  *logger.Logger
}

// NewApp creates a new application
func NewApp(cfg *logger.Config) (*App, error) {
	appLogger, err := logger.NewLogger(*cfg, config.GetString("APP_NAME"))
	if err != nil {
		return nil, err
	}
	defer appLogger.Sync()
	return &App{
		modules: make([]Module, 0),
		logger:  appLogger,
	}, nil
}

func (a *App) SetRouter() *echo.Echo {
	return echo.New()
}

// RegisterModule registers a module with the application
func (a *App) RegisterModule(module Module) {
	a.modules = append(a.modules, module)
	a.logger.Info("Registered module: %s", module.Name())
}

// Initialize initializes the application
func (a *App) Initialize() error {
	a.logger.Info("Initializing application...")

	// Initialize database
	var err *error
	a.db, err = a.SetDatabase().OpenDB()
	if err != nil {
		a.logger.Error("Failed to initialize database: %v", err)
		return *err
	}

	// Set database instance for all modules
	database.DB = a.db

	// Run SQL file migrations first before modules initialize
	sqlRunner := &migrate.Runner{
		DB:           a.db,
		Dir:          migrate.DefaultDir,
		Logger:       a.logger.WithPrefix("migrate"),
		Driver:       config.GetString("DB_DRIVER"),
		SchemaPrefix: database.SchemaPrefix,
	}
	if err := sqlRunner.Up(); err != nil {
		a.logger.Warn("SQL file migration note: %v", err)
	}

	// Initialize object storage (MinIO) — no-op when MINIO_ENDPOINT is unset
	if err := storage.Init(a.logger.WithPrefix("storage")); err != nil {
		a.logger.Error("Failed to initialize object storage: %v", err)
		return err
	}

	// event bus initialization
	event := bus.NewEventBus()

	// initialize router
	a.r = a.SetRouter()
	a.r.Use(middleware.Recover())
	a.r.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{config.GetString("APP_FRONTEND_URL")},
	}))
	a.r.Static("/public", "public")

	// validate request
	a.r.Validator = _validator.NewCustomValidator()

	// Initialize modules
	for _, module := range a.modules {
		a.logger.Info("Initializing module: %s", module.Name())

		// Create module-specific logger
		moduleLogger := a.logger.WithPrefix(module.Name())
		if err := module.Initialize(a.db, moduleLogger, event); err != nil {
			a.logger.Error("Failed to initialize module %s: %v", module.Name(), err)
			return err
		}

		a.logger.Info("Module initialized: %s", module.Name())
	}

	// Run migrations for all modules
	for _, module := range a.modules {
		err := module.Migrations()
		if err != nil {
			a.logger.Error("Failed to run migrations for module %s: %v", module.Name(), err)
		}
		a.logger.Info("Migrations completed for module: %s", module.Name())
	}

	// Initialize HTTP server
	a.server = a.SetServer()

	// api version
	version := fmt.Sprintf("/api/v%s", config.GetString("API_VERSION"))

	// Register routes for all modules
	for _, module := range a.modules {
		a.logger.Info("Registering routes for module: %s", module.Name())
		module.RegisterRoutes(a.r, version)
		a.logger.Info("Routes registered for module: %s", module.Name())
	}

	// append handler to server
	a.server.Handler = a.r

	a.logger.Info("Application initialization completed")

	for _, v := range a.r.Router().Routes() {
		if v.Method != "echo_route_not_found" {
			fmt.Printf("PATH: %v | METHOD: %v\n", v.Path, v.Method)
		}
	}

	return nil
}

// Echo returns the echo instance
func (a *App) Echo() *echo.Echo {
	return a.r
}

// Start starts the application
func (a *App) Start() {
	a.logger.Info("Starting server on %s", a.server.Host)
	a.server.Run()
}

// setup database model
func (a *App) SetDatabase() *database.DBModel {
	return &database.DBModel{
		ServerMode:   config.GetString("SERVER_MODE"),
		Driver:       config.GetString("DB_DRIVER"),
		Host:         config.GetString("DB_HOST"),
		Port:         config.GetString("DB_PORT"),
		Name:         config.GetString("DB_NAME"),
		Username:     config.GetString("DB_USERNAME"),
		Password:     config.GetString("DB_PASSWORD"),
		MaxIdleConn:  config.GetInt("POOL_CONN_IDLE"),
		MaxOpenConn:  config.GetInt("POOL_CONN_MAX"),
		ConnLifeTime: config.GetInt("POOL_CONN_LIFETIME"),
	}
}

// Setup Web Server
func (a *App) SetServer() *server.ServerContext {
	return &server.ServerContext{
		Host:         ":" + config.GetString("PORT"),
		ReadTimeout:  time.Duration(config.GetInt("HTTP_TIMEOUT")),
		WriteTimeout: time.Duration(config.GetInt("HTTP_TIMEOUT")),
	}
}
