package main

import (
	"log"
	"os"

	_ "teracloud/docs"
	"teracloud/internal/app"
	"teracloud/internal/pkg/config"
	"teracloud/internal/pkg/docs"
	"teracloud/internal/pkg/logger"
	"teracloud/internal/pkg/middleware"
	"teracloud/modules/auth"
	"teracloud/modules/billing"
	"teracloud/modules/cart"
	"teracloud/modules/containers"
	"teracloud/modules/orders"
	"teracloud/modules/plans"
	user "teracloud/modules/users"
	"teracloud/modules/vouchers"
)

// @title Ping Uptime API
// @version 1.0
// @description Modular Go application built with Echo, GORM, and DDD principles.
// @termsOfService https://github.com/labstack/echo

// @contact.name API Support
// @contact.url https://github.com/labstack/echo
// @contact.email support@echo.labstack.com

// @license.name MIT
// @license.url https://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {

	// Load configuration from .env
	if err := config.Initialize(); err != nil {
		log.Fatalf("Error loading config: %v", err)
		os.Exit(1)
	}

	// initialize logger
	logCfg := logger.DefaultConfig()

	// Start the application
	application, err := app.NewApp(&logCfg)
	if err != nil {
		log.Fatalf("Error creating application : %v", err)
		os.Exit(1)
	}

	// Initialize Auth middleware
	jwtSignatureKey := config.GetJWTService()
	middleware.InitializeAuth(jwtSignatureKey)

	// register modules
	application.RegisterModule(user.NewModule())
	application.RegisterModule(auth.NewModule())
	application.RegisterModule(plans.NewModule())
	application.RegisterModule(cart.NewModule())
	application.RegisterModule(vouchers.NewModule())
	application.RegisterModule(orders.NewModule())
	application.RegisterModule(containers.NewModule())
	application.RegisterModule(billing.NewModule())

	// initialize the application
	if err := application.Initialize(); err != nil {
		log.Fatalf("Error initializing application : %v", err)
		os.Exit(1)
	}

	// Register API docs routes
	docs.RegisterRoutes(application.Echo())

	// Start the application
	application.Start()
}
