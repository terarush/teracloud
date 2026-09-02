// File: modules/cart/dto/response/cart_response.go
package response

import (
	"encoding/json"
	"time"

	"teracloud/modules/cart/domain/entity"
	planResponse "teracloud/modules/plans/dto/response"
)

type CartItemResponse struct {
	ID                uint                      `json:"id"`
	UserID            uint                      `json:"user_id"`
	PlanID            uint                      `json:"plan_id"`
	Plan              *planResponse.PlanResponse `json:"plan,omitempty"`
	CustomName        string                    `json:"custom_name"`
	DurationMonths    int                       `json:"duration_months"`
	MonthlyPrice      int64                     `json:"monthly_price"`
	Subtotal          int64                     `json:"subtotal"`
	EnvironmentConfig json.RawMessage           `json:"environment_config"`
	CreatedAt         time.Time                 `json:"created_at"`
	UpdatedAt         time.Time                 `json:"updated_at"`
}

type CartSummaryResponse struct {
	Items      []*CartItemResponse `json:"items"`
	TotalItems int                 `json:"total_items"`
	TotalAmount int64              `json:"total_amount"`
}

func FromEntity(item *entity.CartItem) *CartItemResponse {
	resp := &CartItemResponse{
		ID:                item.ID,
		UserID:            item.UserID,
		PlanID:            item.PlanID,
		CustomName:        item.CustomName,
		DurationMonths:    item.DurationMonths,
		EnvironmentConfig: item.EnvironmentConfig,
		CreatedAt:         item.CreatedAt,
		UpdatedAt:         item.UpdatedAt,
	}

	if item.Plan != nil {
		resp.Plan = planResponse.FromEntity(item.Plan)
		resp.MonthlyPrice = item.Plan.PriceMonthly
		resp.Subtotal = item.Plan.PriceMonthly * int64(item.DurationMonths)
	}

	return resp
}

func FromEntities(items []*entity.CartItem) *CartSummaryResponse {
	responses := make([]*CartItemResponse, len(items))
	var totalAmount int64 = 0

	for i, item := range items {
		resp := FromEntity(item)
		responses[i] = resp
		totalAmount += resp.Subtotal
	}

	return &CartSummaryResponse{
		Items:       responses,
		TotalItems:  len(items),
		TotalAmount: totalAmount,
	}
}
