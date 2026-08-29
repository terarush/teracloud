// File: modules/billing/module.go
package billing

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/scheduler"
	"ruang-tukar/modules/billing/domain/repository"
	"ruang-tukar/modules/billing/domain/service"
	"ruang-tukar/modules/billing/handler"
	containerEntity "ruang-tukar/modules/containers/domain/entity"
	orderEntity "ruang-tukar/modules/orders/domain/entity"
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
	subService     *service.SubscriptionService
	invoiceService *service.InvoiceService
	reminderService *service.ReminderService
	schedulerSvc   *service.BillingSchedulerService
	billingHandler *handler.BillingHandler
	scheduler      *scheduler.Scheduler
	event          *bus.EventBus
}

func (m *Module) Name() string {
	return "billing"
}

func (m *Module) Initialize(db *gorm.DB, log *logger.Logger, event *bus.EventBus) error {
	m.db = db
	m.logger = log
	m.event = event

	// Repositories
	subRepo := repository.NewSubscriptionRepositoryImpl()
	invRepo := repository.NewInvoiceRepositoryImpl()
	pRepo := planRepo.NewPlanRepositoryImpl()
	pService := planService.NewPlanService(pRepo)
	uRepo := userRepo.NewUserRepositoryImpl()
	uService := userService.NewUserService(uRepo)

	// Services
	m.subService = service.NewSubscriptionService(subRepo)
	m.invoiceService = service.NewInvoiceService(invRepo)
	m.reminderService = service.NewReminderService()
	m.schedulerSvc = service.NewBillingSchedulerService(subRepo, m.reminderService, m.logger)

	// Handler
	m.billingHandler = handler.NewBillingHandler(m.logger, m.event, m.subService, m.invoiceService)

	// Event listener: order.paid -> create subscription + invoice + payment email
	m.event.SubscribeFunc("order.paid", func(ev bus.Event) {
		if order, ok := ev.Payload.(*orderEntity.Order); ok {
			ctx := context.Background()
			user, _ := uService.GetUserByID(ctx, order.UserID)

			if len(order.Items) > 0 {
				for _, item := range order.Items {
					plan, _ := pService.GetPlanByID(ctx, item.PlanID)
					planName := "Docker Plan"
					if plan != nil {
						planName = plan.Name
					}

					// 1. Create subscription
					sub, _ := m.subService.CreateSubscription(ctx, order.UserID, item.PlanID, order.ID)

					// 2. Generate invoice
					var subID *uint
					if sub != nil {
						subID = &sub.ID
						item.SubscriptionID = subID
					}
					_, _ = m.invoiceService.GenerateInvoice(ctx, order.UserID, subID, &order.ID, item.Subtotal, planName)
				}
			} else if order.PlanID != nil {
				plan, _ := pService.GetPlanByID(ctx, *order.PlanID)
				planName := "Docker Plan"
				if plan != nil {
					planName = plan.Name
				}

				sub, _ := m.subService.CreateSubscription(ctx, order.UserID, *order.PlanID, order.ID)
				var subID *uint
				if sub != nil {
					subID = &sub.ID
				}
				_, _ = m.invoiceService.GenerateInvoice(ctx, order.UserID, subID, &order.ID, order.Amount, planName)
			}

			// Send confirmation email
			if user != nil {
				_ = m.reminderService.SendPaymentSuccessEmail(user.Email, user.FirstName, fmt.Sprintf("Order #%s", order.OrderNumber), order.Amount)
			}
		}
	})

	// Event listener: container.ready -> link container_id to subscription + send ready email
	m.event.SubscribeFunc("container.ready", func(ev bus.Event) {
		if container, ok := ev.Payload.(*containerEntity.Container); ok {
			ctx := context.Background()
			if container.SubscriptionID > 0 {
				_ = m.subService.SetContainerID(ctx, container.SubscriptionID, container.ID)
			}

			user, _ := uService.GetUserByID(ctx, container.UserID)
			if user != nil {
				var assigned map[string]int
				_ = json.Unmarshal(container.AssignedPorts, &assigned)
				var portSummary strings.Builder
				for k, v := range assigned {
					portSummary.WriteString(fmt.Sprintf("- %s: Port %d<br>", k, v))
				}
				if portSummary.Len() == 0 {
					portSummary.WriteString("- Port internal diteruskan otomatis<br>")
				}

				_ = m.reminderService.SendContainerReadyEmail(
					user.Email,
					user.FirstName,
					container.ContainerName,
					container.ImageName+":"+container.ImageTag,
					"localhost",
					portSummary.String(),
				)
			}
		}
	})

	// Start Scheduler
	m.scheduler = scheduler.New(m.logger)
	m.scheduler.Every(1*time.Hour, "CheckExpiringSubscriptions", m.schedulerSvc.CheckExpiringSubscriptions)
	m.scheduler.Start()

	m.logger.Info("Billing module initialized successfully")
	return nil
}

func (m *Module) RegisterRoutes(e *echo.Echo, basePath string) {
	m.billingHandler.RegisterRoutes(e, basePath)
}

func (m *Module) Migrations() error {
	return nil
}

func (m *Module) Logger() *logger.Logger {
	return m.logger
}

func NewModule() *Module {
	return &Module{}
}
