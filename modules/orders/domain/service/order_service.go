// File: modules/orders/domain/service/order_service.go
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/config"
	"ruang-tukar/internal/pkg/midtrans"
	cartEntity "ruang-tukar/modules/cart/domain/entity"
	cartRepository "ruang-tukar/modules/cart/domain/repository"
	"ruang-tukar/modules/orders/domain/entity"
	"ruang-tukar/modules/orders/domain/repository"
	orderErrs "ruang-tukar/modules/orders/errs"
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

// CheckoutCart checks out items from the user's cart into a new order.
func (s *OrderService) CheckoutCart(ctx context.Context, userID uint, cartItemIDs []uint) (*entity.Order, error) {
	// 1. Fetch user and cart items
	user, err := s.userService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	cartRepo := cartRepository.NewCartRepository()
	cartItems, err := cartRepo.FindByUserID(ctx, userID)
	if err != nil || len(cartItems) == 0 {
		return nil, orderErrs.ErrOrderNotFound
	}

	// Filter if specific cart IDs passed
	var selectedItems []*cartEntity.CartItem
	if len(cartItemIDs) > 0 {
		idMap := make(map[uint]bool)
		for _, id := range cartItemIDs {
			idMap[id] = true
		}
		for _, ci := range cartItems {
			if idMap[ci.ID] {
				selectedItems = append(selectedItems, ci)
			}
		}
	} else {
		selectedItems = cartItems
	}

	if len(selectedItems) == 0 {
		return nil, orderErrs.ErrOrderNotFound
	}

	var totalAmount int64 = 0
	var orderItems []*entity.OrderItem
	var itemNames []string

	for _, ci := range selectedItems {
		plan, err := s.planService.GetPlanByID(ctx, ci.PlanID)
		if err != nil || !plan.IsActive {
			return nil, orderErrs.ErrPlanLimitReached
		}

		// Check plan limits
		activeCount, err := s.orderRepo.CountActiveByUserIDAndPlanID(ctx, userID, ci.PlanID)
		if err != nil {
			return nil, err
		}
		if int(activeCount) >= plan.MaxPerUser {
			return nil, orderErrs.ErrPlanLimitReached
		}

		duration := ci.DurationMonths
		if duration <= 0 {
			duration = 1
		}

		subtotal := plan.PriceMonthly * int64(duration)
		totalAmount += subtotal
		itemNames = append(itemNames, fmt.Sprintf("%s (%d mo)", plan.Name, duration))

		orderItems = append(orderItems, &entity.OrderItem{
			PlanID:             plan.ID,
			Plan:               plan,
			CustomName:         ci.CustomName,
			DurationMonths:     duration,
			UnitPrice:          plan.PriceMonthly,
			Subtotal:           subtotal,
			EnvironmentConfig:  ci.EnvironmentConfig,
			ProvisioningStatus: "pending",
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		})
	}

	// Generate order codes
	orderNumber := generateOrderNumber()
	midtransOrderID := fmt.Sprintf("TERA-%s", orderNumber)

	frontendURL := config.GetString("APP_FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	callbackURL := fmt.Sprintf("%s/app/orders/finish?order_id=%s", frontendURL, orderNumber)

	combinedItemName := strings.Join(itemNames, ", ")
	if len(combinedItemName) > 45 {
		combinedItemName = fmt.Sprintf("%d Container Plans", len(orderItems))
	}

	snapResp, err := s.midtrans.CreateTransaction(midtrans.SnapRequest{
		OrderID:     midtransOrderID,
		GrossAmount: totalAmount,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		ItemName:    combinedItemName,
		CallbackURL: callbackURL,
	})

	var snapToken, snapRedirectURL string
	if err != nil {
		snapToken = fmt.Sprintf("snap-token-mock-%s", hex.EncodeToString([]byte(midtransOrderID))[:12])
		snapRedirectURL = fmt.Sprintf("%s&mock_token=%s", callbackURL, snapToken)
	} else {
		snapToken = snapResp.Token
		snapRedirectURL = snapResp.RedirectURL
	}

	expiredAt := time.Now().Add(24 * time.Hour)
	firstPlanID := orderItems[0].PlanID
	order := &entity.Order{
		OrderNumber:     orderNumber,
		UserID:          userID,
		PlanID:          &firstPlanID,
		OrderType:       "new_purchase",
		Amount:          totalAmount,
		TotalAmount:     totalAmount,
		Currency:        "IDR",
		Status:          "awaiting_payment",
		MidtransOrderID: midtransOrderID,
		SnapToken:       snapToken,
		SnapRedirectURL: snapRedirectURL,
		ExpiredAt:       &expiredAt,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if err := s.orderRepo.CreateWithItems(ctx, order, orderItems); err != nil {
		return nil, err
	}

	// Remove checked-out items from cart
	for _, ci := range selectedItems {
		_ = cartRepo.Delete(ctx, ci.ID, userID)
	}

	return order, nil
}

// CreateNewPurchaseOrder handles initial plan direct purchase.
func (s *OrderService) CreateNewPurchaseOrder(ctx context.Context, userID, planID uint, customName string, durationMonths int) (*entity.Order, error) {
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

	if durationMonths <= 0 {
		durationMonths = 1
	}

	totalAmount := plan.PriceMonthly * int64(durationMonths)

	// Generate order codes
	orderNumber := generateOrderNumber()
	midtransOrderID := fmt.Sprintf("TERA-%s", orderNumber)

	// Call Midtrans Snap
	frontendURL := config.GetString("APP_FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:5173"
	}
	callbackURL := fmt.Sprintf("%s/app/orders/finish?order_id=%s", frontendURL, orderNumber)

	snapResp, err := s.midtrans.CreateTransaction(midtrans.SnapRequest{
		OrderID:     midtransOrderID,
		GrossAmount: totalAmount,
		FirstName:   user.FirstName,
		LastName:    user.LastName,
		Email:       user.Email,
		ItemName:    fmt.Sprintf("%s (%d mo)", plan.Name, durationMonths),
		CallbackURL: callbackURL,
	})
	var snapToken, snapRedirectURL string
	if err != nil {
		snapToken = fmt.Sprintf("snap-token-mock-%s", hex.EncodeToString([]byte(midtransOrderID))[:12])
		snapRedirectURL = fmt.Sprintf("%s&mock_token=%s", callbackURL, snapToken)
	} else {
		snapToken = snapResp.Token
		snapRedirectURL = snapResp.RedirectURL
	}

	expiredAt := time.Now().Add(24 * time.Hour)
	order := &entity.Order{
		OrderNumber:     orderNumber,
		UserID:          userID,
		PlanID:          &planID,
		OrderType:       "new_purchase",
		Amount:          totalAmount,
		TotalAmount:     totalAmount,
		Currency:        "IDR",
		Status:          "awaiting_payment",
		MidtransOrderID: midtransOrderID,
		SnapToken:       snapToken,
		SnapRedirectURL: snapRedirectURL,
		ExpiredAt:       &expiredAt,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	orderItem := &entity.OrderItem{
		PlanID:             plan.ID,
		Plan:               plan,
		CustomName:         customName,
		DurationMonths:     durationMonths,
		UnitPrice:          plan.PriceMonthly,
		Subtotal:           totalAmount,
		ProvisioningStatus: "pending",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := s.orderRepo.CreateWithItems(ctx, order, []*entity.OrderItem{orderItem}); err != nil {
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

// MarkOrderAsPaid marks an order as paid and triggers order.paid event.
func (s *OrderService) MarkOrderAsPaid(ctx context.Context, orderID uint, paymentType, transactionID string) (*entity.Order, error) {
	order, err := s.orderRepo.FindByID(ctx, orderID)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, orderErrs.ErrOrderNotFound
		}
		return nil, err
	}

	if order.Status == "paid" {
		return order, nil
	}

	now := time.Now()
	order.Status = "paid"
	order.PaidAt = &now
	if paymentType != "" {
		order.MidtransPaymentType = paymentType
	}
	if transactionID != "" {
		order.MidtransTransactionID = transactionID
	}
	order.UpdatedAt = now

	if err := s.orderRepo.Update(ctx, order); err != nil {
		return nil, err
	}

	s.event.Publish(bus.Event{
		Type:    "order.paid",
		Payload: order,
	})

	return order, nil
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

func (s *OrderService) GetOrderByOrderNumber(ctx context.Context, orderNumber string) (*entity.Order, error) {
	order, err := s.orderRepo.FindByOrderNumber(ctx, orderNumber)
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
