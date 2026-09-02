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

	"teracloud/internal/pkg/bus"
	"teracloud/internal/pkg/config"
	"teracloud/internal/pkg/midtrans"
	cartEntity "teracloud/modules/cart/domain/entity"
	cartRepository "teracloud/modules/cart/domain/repository"
	"teracloud/modules/orders/domain/entity"
	"teracloud/modules/orders/domain/repository"
	orderErrs "teracloud/modules/orders/errs"
	planService "teracloud/modules/plans/domain/service"
	userEntity "teracloud/modules/users/domain/entity"
	userService "teracloud/modules/users/domain/service"
	voucherService "teracloud/modules/vouchers/domain/service"
)

type OrderService struct {
	orderRepo      repository.OrderRepository
	planService    *planService.PlanService
	userService    *userService.UserService
	voucherService *voucherService.VoucherService
	midtrans       *midtrans.Client
	event          *bus.EventBus
}

func NewOrderService(
	orderRepo repository.OrderRepository,
	planService *planService.PlanService,
	userService *userService.UserService,
	voucherService *voucherService.VoucherService,
	midtrans *midtrans.Client,
	event *bus.EventBus,
) *OrderService {
	return &OrderService{
		orderRepo:      orderRepo,
		planService:    planService,
		userService:    userService,
		voucherService: voucherService,
		midtrans:       midtrans,
		event:          event,
	}
}

// CheckoutCart checks out items from the user's cart into a new order.
func (s *OrderService) CheckoutCart(ctx context.Context, userID uint, cartItemIDs []uint, voucherCode string) (*entity.Order, error) {
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

	var totalBeforeDiscount int64 = 0
	var orderItems []*entity.OrderItem
	var itemNames []string
	var discountItems []voucherService.DiscountItem

	for _, ci := range selectedItems {
		plan, err := s.planService.GetPlanByID(ctx, ci.PlanID)
		if err != nil || !plan.IsActive {
			return nil, orderErrs.ErrPlanLimitReached
		}

		duration := ci.DurationMonths
		if duration <= 0 {
			duration = 1
		}

		subtotal := plan.PriceMonthly * int64(duration)
		totalBeforeDiscount += subtotal
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

		discountItems = append(discountItems, voucherService.DiscountItem{
			PlanID:    plan.ID,
			UnitPrice: plan.PriceMonthly,
			Duration:  duration,
			Subtotal:  subtotal,
		})
	}

	// Apply voucher (if any) per eligible plan item
	var voucherRes *voucherService.VoucherResult
	var totalAmount int64 = totalBeforeDiscount
	if strings.TrimSpace(voucherCode) != "" {
		voucherRes, err = s.voucherService.ApplyVoucher(ctx, voucherCode, userID, discountItems)
		if err != nil {
			return nil, err
		}
		totalAmount = voucherRes.TotalAfter
		for i, disc := range voucherRes.DiscountPerItem {
			if disc > 0 {
				orderItems[i].DiscountAmount = disc
			}
		}
	}

	order, err := s.buildOrder(user, userID, orderItems, itemNames, totalAmount, totalBeforeDiscount, voucherRes)
	if err != nil {
		return nil, err
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
func (s *OrderService) CreateNewPurchaseOrder(ctx context.Context, userID, planID uint, customName string, durationMonths int, voucherCode string) (*entity.Order, error) {
	plan, err := s.planService.GetPlanByID(ctx, planID)
	if err != nil {
		return nil, err
	}
	if !plan.IsActive {
		return nil, orderErrs.ErrPlanLimitReached
	}

	user, err := s.userService.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	if durationMonths <= 0 {
		durationMonths = 1
	}

	subtotal := plan.PriceMonthly * int64(durationMonths)

	// Apply voucher (if any) to this plan item
	var voucherRes *voucherService.VoucherResult
	totalAmount := subtotal
	if strings.TrimSpace(voucherCode) != "" {
		voucherRes, err = s.voucherService.ApplyVoucher(ctx, voucherCode, userID, []voucherService.DiscountItem{
			{PlanID: plan.ID, UnitPrice: plan.PriceMonthly, Duration: durationMonths, Subtotal: subtotal},
		})
		if err != nil {
			return nil, err
		}
		totalAmount = voucherRes.TotalAfter
	}

	orderItem := &entity.OrderItem{
		PlanID:             plan.ID,
		Plan:               plan,
		CustomName:         customName,
		DurationMonths:     durationMonths,
		UnitPrice:          plan.PriceMonthly,
		Subtotal:           subtotal,
		ProvisioningStatus: "pending",
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}
	if voucherRes != nil && len(voucherRes.DiscountPerItem) > 0 && voucherRes.DiscountPerItem[0] > 0 {
		orderItem.DiscountAmount = voucherRes.DiscountPerItem[0]
	}

	order, err := s.buildOrder(user, userID, []*entity.OrderItem{orderItem},
		[]string{fmt.Sprintf("%s (%d mo)", plan.Name, durationMonths)}, totalAmount, subtotal, voucherRes)
	if err != nil {
		return nil, err
	}

	if err := s.orderRepo.CreateWithItems(ctx, order, []*entity.OrderItem{orderItem}); err != nil {
		return nil, err
	}

	return order, nil
}

// buildOrder assembles the order entity (midtrans transaction, voucher, totals).
func (s *OrderService) buildOrder(user *userEntity.User, userID uint, orderItems []*entity.OrderItem, itemNames []string, totalAmount, totalBeforeDiscount int64, voucherRes *voucherService.VoucherResult) (*entity.Order, error) {
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
	var firstPlanID uint
	if len(orderItems) > 0 {
		firstPlanID = orderItems[0].PlanID
	}

	var discountAmount int64
	if voucherRes != nil {
		discountAmount = voucherRes.TotalDiscount
	} else {
		discountAmount = totalBeforeDiscount - totalAmount
	}

	order := &entity.Order{
		OrderNumber:     orderNumber,
		UserID:          userID,
		PlanID:          &firstPlanID,
		OrderType:       "new_purchase",
		Amount:          totalAmount,
		TotalAmount:     totalAmount,
		DiscountAmount:  discountAmount,
		Currency:        "IDR",
		Status:          "awaiting_payment",
		MidtransOrderID: midtransOrderID,
		SnapToken:       snapToken,
		SnapRedirectURL: snapRedirectURL,
		ExpiredAt:       &expiredAt,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	if voucherRes != nil && voucherRes.Voucher != nil {
		v := voucherRes.Voucher
		order.VoucherID = &v.ID
		order.VoucherCode = v.Code
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

		s.recordVoucherUsage(ctx, order)

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

	s.recordVoucherUsage(ctx, order)

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

// recordVoucherUsage records voucher redemption when an order is paid.
func (s *OrderService) recordVoucherUsage(ctx context.Context, order *entity.Order) {
	if order.VoucherID == nil {
		return
	}
	_ = s.voucherService.RecordUsage(ctx, *order.VoucherID, order.UserID, order.ID, order.DiscountAmount)
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
