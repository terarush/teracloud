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
