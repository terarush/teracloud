package auth

import (
	authEntity "ruang-tukar/modules/auth/domain/entity"
	authRepo "ruang-tukar/modules/auth/domain/repository"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/config"
	"ruang-tukar/internal/pkg/jwt"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/mailer"
	"ruang-tukar/internal/pkg/oauth"
	"ruang-tukar/modules/auth/domain/service"
	"ruang-tukar/modules/auth/handler"
	"ruang-tukar/modules/users/domain/repository"

	"fmt"
	"os"
	"strconv"

	"github.com/labstack/echo/v5"
	"gorm.io/gorm"
)

type Module struct {
	db          *gorm.DB
	logger      *logger.Logger
	authService *service.AuthService
	authHandler *handler.AuthHandler
	event       *bus.EventBus
	frontendURL string
}

func (m *Module) Name() string {
	return "auth"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event
	m.frontendURL = os.Getenv("FRONTEND_URL")
	if m.frontendURL == "" {
		m.frontendURL = "http://localhost:3000"
	}

	// Initialize repositories
	userRepo := repository.NewUserRepositoryImpl()
	resetTokenRepo := authRepo.NewPasswordResetTokenRepository()

	// Initialize mailer (if SMTP configured)
	var mail *mailer.Mailer
	if host := os.Getenv("SMTP_HOST"); host != "" {
		port, _ := strconv.Atoi(os.Getenv("SMTP_PORT"))
		if port == 0 {
			port = 587
		}
		mail = mailer.New(mailer.Config{
			Host:     host,
			Port:     port,
			Username: os.Getenv("SMTP_USERNAME"),
			Password: os.Getenv("SMTP_PASSWORD"),
			From:     os.Getenv("SMTP_FROM"),
		})
	} else {
		log.Warn("SMTP not configured — forgot password will log tokens only")
	}

	// Initialize services
	m.authService = service.NewAuthService(userRepo, resetTokenRepo, mail)

	// Initialize JWT
	jwtService := config.GetJWTService()
	refreshJWT := jwt.NewJWTImpl(config.GetRefreshSignature(), 30)

	// Initialize handlers
	m.authHandler = handler.NewAuthHandler(m.logger, m.event, m.authService, jwtService, refreshJWT, m.frontendURL)

	oauth.InitGoogleOAuth()

	m.logger.Info("Auth module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	if m.authHandler == nil {
		m.logger.Error("AuthHandler is nil, cannot register routes")
		return
	}
	m.authHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	if m.db == nil {
		return fmt.Errorf("database is nil")
	}
	return m.db.AutoMigrate(
		&authEntity.PasswordResetToken{},
	)
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

func NewModule() *Module {
	return &Module{}
}
