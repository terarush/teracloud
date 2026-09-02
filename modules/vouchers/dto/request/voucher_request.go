// File: modules/vouchers/dto/request/voucher_request.go
package request

import (
	"time"
)

type CreateVoucherRequest struct {
	Code              string     `json:"code" validate:"required"`
	Name              string     `json:"name"`
	Description       string     `json:"description"`
	DiscountType      string     `json:"discount_type" validate:"required,oneof=percentage fixed_amount"`
	DiscountValue     int64      `json:"discount_value" validate:"required,min=1"`
	MinOrderAmount    int64      `json:"min_order_amount"`
	MaxDiscountAmount *int64     `json:"max_discount_amount"`
	AppliesTo         string     `json:"applies_to" validate:"omitempty,oneof=all specific_plans"`
	TotalUsageLimit   *int       `json:"total_usage_limit"`
	PerUserUsageLimit *int       `json:"per_user_usage_limit"`
	StartAt           *time.Time `json:"start_at"`
	EndAt             *time.Time `json:"end_at"`
	IsActive          *bool      `json:"is_active"`
	PlanIDs           []uint     `json:"plan_ids"`
}

type UpdateVoucherRequest struct {
	Name              string     `json:"name"`
	Description       string     `json:"description"`
	DiscountType      string     `json:"discount_type" validate:"omitempty,oneof=percentage fixed_amount"`
	DiscountValue     int64      `json:"discount_value" validate:"omitempty,min=1"`
	MinOrderAmount    int64      `json:"min_order_amount"`
	MaxDiscountAmount *int64     `json:"max_discount_amount"`
	AppliesTo         string     `json:"applies_to" validate:"omitempty,oneof=all specific_plans"`
	TotalUsageLimit   *int       `json:"total_usage_limit"`
	PerUserUsageLimit *int       `json:"per_user_usage_limit"`
	StartAt           *time.Time `json:"start_at"`
	EndAt             *time.Time `json:"end_at"`
	IsActive          *bool      `json:"is_active"`
	PlanIDs           []uint     `json:"plan_ids"`
}

// QuoteItem describes a single line item to validate a voucher against.
type QuoteItem struct {
	PlanID    uint  `json:"plan_id" validate:"required"`
	UnitPrice int64 `json:"unit_price" validate:"required,min=0"`
	Duration  int   `json:"duration_months" validate:"required,min=1"`
	Subtotal  int64 `json:"subtotal" validate:"required,min=0"`
}

// ValidateVoucherRequest validates a voucher against line items and returns the discount.
type ValidateVoucherRequest struct {
	VoucherCode string      `json:"voucher_code" validate:"required"`
	Items       []QuoteItem `json:"items" validate:"required,min=1,dive"`
}
