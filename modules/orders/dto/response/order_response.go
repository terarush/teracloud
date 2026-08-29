// File: modules/orders/dto/response/order_response.go
package response

import (
	"time"

	"ruang-tukar/modules/orders/domain/entity"
)

type OrderResponse struct {
	ID                  uint       `json:"id"`
	OrderNumber         string     `json:"order_number"`
	UserID              uint       `json:"user_id"`
	PlanID              uint       `json:"plan_id"`
	SubscriptionID      *uint      `json:"subscription_id,omitempty"`
	OrderType           string     `json:"order_type"`
	Amount              int64      `json:"amount"`
	Currency            string     `json:"currency"`
	Status              string     `json:"status"`
	MidtransOrderID     string     `json:"midtrans_order_id"`
	MidtransPaymentType string     `json:"midtrans_payment_type,omitempty"`
	SnapToken           string     `json:"snap_token,omitempty"`
	SnapRedirectURL     string     `json:"snap_redirect_url,omitempty"`
	PaidAt              *time.Time `json:"paid_at,omitempty"`
	ExpiredAt           *time.Time `json:"expired_at,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

func FromEntity(order *entity.Order) *OrderResponse {
	return &OrderResponse{
		ID:                  order.ID,
		OrderNumber:         order.OrderNumber,
		UserID:              order.UserID,
		PlanID:              order.PlanID,
		SubscriptionID:      order.SubscriptionID,
		OrderType:           order.OrderType,
		Amount:              order.Amount,
		Currency:            order.Currency,
		Status:              order.Status,
		MidtransOrderID:     order.MidtransOrderID,
		MidtransPaymentType: order.MidtransPaymentType,
		SnapToken:           order.SnapToken,
		SnapRedirectURL:     order.SnapRedirectURL,
		PaidAt:              order.PaidAt,
		ExpiredAt:           order.ExpiredAt,
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
