// File: modules/orders/domain/service/order_service.go
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/midtrans"
	orderErrs "ruang-tukar/modules/orders/errs"
	"ruang-tukar/modules/orders/domain/entity"
	"ruang-tukar/modules/orders/domain/repository"
	planService "ruang-tukar/modules/plans/domain/service"
	userService "ruang-tukar/modules/users/domain/service"
)

type OrderService struct {
	orderRepo   repository.OrderRepository
	planService *planService.PlanService
	userService *userService.UserService
	midtrans    *midtrans.Client
	event       *bus.EventBus
}

func NewOrderService(
	orderRepo repository.OrderRepository,
	planService *planService.PlanService,
	userService *userService.UserService,
	midtrans *midtrans.Client,
	event *bus.EventBus,
) *OrderService {
	return &OrderService{
		orderRepo:   orderRepo,
		planService: planService,
		userService: userService,
		midtrans:    midtrans,
		event:       event,
	}
}

// CreateNewPurchaseOrder handles initial plan purchase.
func (s *OrderService) CreateNewPurchaseOrder(ctx context.Context, userID, planID uint) (*entity.Order, error) {
	plan, err := s.planService.GetPlanByID(ctx, planID)
	if err != nil {
		return nil, err
	}
	if !plan.IsActive {
		return nil, orderErrs.ErrPlanLimitReached
	}

	// Check user plan limit
	activeCount, err := s.orderRepo.CountActiveByUserIDAndPlanID(ctx, userID, planID)
	if err != nil {
		return nil, err
	}
	if int(activeCount) >= plan.MaxPerUser {
		return nil, orderErrs.ErrPlanLimitReached
	}

	user, err := s.userService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Generate order codes
	orderNumber := generateOrderNumber()
	midtransOrderID := fmt.Sprintf("TERA-%s", orderNumber)

	// Call Midtrans Snap
	snapResp, err := s.midtrans.CreateTransaction(midtrans.SnapRequest{
		OrderID:     midtransOrderID,
		GrossAmount: plan.PriceMonthly,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		ItemName:    plan.Name,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create midtrans transaction: %w", err)
	}

	expiredAt := time.Now().Add(24 * time.Hour)
	order := &entity.Order{
		OrderNumber:     orderNumber,
		UserID:          userID,
		PlanID:          planID,
		OrderType:       "new_purchase",
		Amount:          plan.PriceMonthly,
		Currency:        "IDR",
		Status:          "awaiting_payment",
		MidtransOrderID: midtransOrderID,
		SnapToken:       snapResp.Token,
		SnapRedirectURL: snapResp.RedirectURL,
		ExpiredAt:       &expiredAt,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.orderRepo.Create(ctx, order); err != nil {
		return nil, err
	}

	return order, nil
}

// HandleWebhookNotification processes Midtrans payment webhook.
func (s *OrderService) HandleWebhookNotification(ctx context.Context, payload map[string]interface{}) error {
	orderID, _ := payload["order_id"].(string)
	statusCode, _ := payload["status_code"].(string)
	grossAmount, _ := payload["gross_amount"].(string)
	signatureKey, _ := payload["signature_key"].(string)
	transactionStatus, _ := payload["transaction_status"].(string)
	paymentType, _ := payload["payment_type"].(string)
	transactionID, _ := payload["transaction_id"].(string)

	// Verify signature
	if !s.midtrans.VerifySignature(orderID, statusCode, grossAmount, signatureKey) {
		return orderErrs.ErrInvalidWebhookSignature
	}

	order, err := s.orderRepo.FindByMidtransOrderID(ctx, orderID)
	if err != nil {
		return orderErrs.ErrOrderNotFound
	}

	if order.Status == "paid" {
		return nil // Idempotent: already processed
	}

	metadataBytes, _ := json.Marshal(payload)
	order.Metadata = metadataBytes
	order.MidtransPaymentType = paymentType
	order.MidtransTransactionID = transactionID
	order.UpdatedAt = time.Now()

	switch transactionStatus {
	case "capture", "settlement":
		now := time.Now()
		order.Status = "paid"
		order.PaidAt = &now

		if err := s.orderRepo.Update(ctx, order); err != nil {
			return err
		}

		// Publish event: order.paid
		s.event.Publish(bus.Event{
			Type:    "order.paid",
			Payload: order,
		})

	case "deny", "cancel", "expire":
		order.Status = "failed"
		_ = s.orderRepo.Update(ctx, order)
	}

	return nil
}

func (s *OrderService) GetOrdersByUserID(ctx context.Context, userID uint) ([]*entity.Order, error) {
	return s.orderRepo.FindByUserID(ctx, userID)
}

func (s *OrderService) GetOrderByID(ctx context.Context, id uint) (*entity.Order, error) {
	order, err := s.orderRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, orderErrs.ErrOrderNotFound
		}
		return nil, err
	}
	return order, nil
}

func (s *OrderService) GetAllOrders(ctx context.Context) ([]*entity.Order, error) {
	return s.orderRepo.FindAll(ctx)
}

func generateOrderNumber() string {
	b := make([]byte, 3)
	_, _ = rand.Read(b)
	return fmt.Sprintf("TC-%s-%s", time.Now().Format("20060102"), stringsToUpper(hex.EncodeToString(b)))
}

func stringsToUpper(s string) string {
	b := []byte(s)
	for i := range b {
		if b[i] >= 'a' && b[i] <= 'z' {
			b[i] -= 32
		}
	}
	return string(b)
}
