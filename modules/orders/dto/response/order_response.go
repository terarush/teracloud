// File: modules/orders/dto/response/order_response.go
package response

import (
	"time"

	"teracloud/modules/orders/domain/entity"
)

type OrderItemResponse struct {
	ID                 uint      `json:"id"`
	OrderID            uint      `json:"order_id"`
	PlanID             uint      `json:"plan_id"`
	SubscriptionID     *uint     `json:"subscription_id,omitempty"`
	CustomName         string    `json:"custom_name"`
	DurationMonths     int       `json:"duration_months"`
	UnitPrice          int64     `json:"unit_price"`
	Subtotal           int64     `json:"subtotal"`
	DiscountAmount     int64     `json:"discount_amount"`
	ProvisioningStatus string    `json:"provisioning_status"`
	ErrorMessage       *string   `json:"error_message,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type OrderResponse struct {
	ID                  uint                 `json:"id"`
	OrderNumber         string               `json:"order_number"`
	UserID              uint                 `json:"user_id"`
	PlanID              *uint                `json:"plan_id,omitempty"`
	SubscriptionID      *uint                `json:"subscription_id,omitempty"`
	OrderType           string               `json:"order_type"`
	Amount              int64                `json:"amount"`
	TotalAmount         int64                `json:"total_amount"`
	DiscountAmount      int64                `json:"discount_amount"`
	VoucherCode         string               `json:"voucher_code,omitempty"`
	Currency            string               `json:"currency"`
	Status              string               `json:"status"`
	MidtransOrderID     string               `json:"midtrans_order_id"`
	MidtransPaymentType string               `json:"midtrans_payment_type,omitempty"`
	SnapToken           string               `json:"snap_token,omitempty"`
	SnapRedirectURL     string               `json:"snap_redirect_url,omitempty"`
	PaidAt              *time.Time           `json:"paid_at,omitempty"`
	ExpiredAt           *time.Time           `json:"expired_at,omitempty"`
	Items               []*OrderItemResponse `json:"items,omitempty"`
	CreatedAt           time.Time            `json:"created_at"`
	UpdatedAt           time.Time            `json:"updated_at"`
}

func FromOrderItemEntity(item *entity.OrderItem) *OrderItemResponse {
	return &OrderItemResponse{
		ID:                 item.ID,
		OrderID:            item.OrderID,
		PlanID:             item.PlanID,
		SubscriptionID:     item.SubscriptionID,
		CustomName:         item.CustomName,
		DurationMonths:     item.DurationMonths,
		UnitPrice:          item.UnitPrice,
		Subtotal:           item.Subtotal,
		DiscountAmount:     item.DiscountAmount,
		ProvisioningStatus: item.ProvisioningStatus,
		ErrorMessage:       item.ErrorMessage,
		CreatedAt:          item.CreatedAt,
		UpdatedAt:          item.UpdatedAt,
	}
}

func FromEntity(order *entity.Order) *OrderResponse {
	var itemsResp []*OrderItemResponse
	if len(order.Items) > 0 {
		itemsResp = make([]*OrderItemResponse, len(order.Items))
		for i, item := range order.Items {
			itemsResp[i] = FromOrderItemEntity(item)
		}
	}

	totalAmount := order.TotalAmount
	if totalAmount == 0 {
		totalAmount = order.Amount
	}

	return &OrderResponse{
		ID:                  order.ID,
		OrderNumber:         order.OrderNumber,
		UserID:              order.UserID,
		PlanID:              order.PlanID,
		SubscriptionID:      order.SubscriptionID,
		OrderType:           order.OrderType,
		Amount:              order.Amount,
		TotalAmount:         totalAmount,
		DiscountAmount:      order.DiscountAmount,
		VoucherCode:         order.VoucherCode,
		Currency:            order.Currency,
		Status:              order.Status,
		MidtransOrderID:     order.MidtransOrderID,
		MidtransPaymentType: order.MidtransPaymentType,
		SnapToken:           order.SnapToken,
		SnapRedirectURL:     order.SnapRedirectURL,
		PaidAt:              order.PaidAt,
		ExpiredAt:           order.ExpiredAt,
		Items:               itemsResp,
		CreatedAt:           order.CreatedAt,
		UpdatedAt:           order.UpdatedAt,
	}
}

func FromEntities(orders []*entity.Order) []*OrderResponse {
	responses := make([]*OrderResponse, len(orders))
	for i, order := range orders {
		responses[i] = FromEntity(order)
	}
	return responses
}
