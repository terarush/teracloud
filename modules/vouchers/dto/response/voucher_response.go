// File: modules/vouchers/dto/response/voucher_response.go
package response

import (
	"time"

	"teracloud/modules/vouchers/domain/entity"
	"teracloud/modules/vouchers/domain/service"
)

type PlanRef struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type VoucherResponse struct {
	ID                uint       `json:"id"`
	Code              string     `json:"code"`
	Name              string     `json:"name"`
	Description       string     `json:"description"`
	DiscountType      string     `json:"discount_type"`
	DiscountValue     int64      `json:"discount_value"`
	MinOrderAmount    int64      `json:"min_order_amount"`
	MaxDiscountAmount *int64     `json:"max_discount_amount"`
	AppliesTo         string     `json:"applies_to"`
	TotalUsageLimit   *int       `json:"total_usage_limit"`
	PerUserUsageLimit *int       `json:"per_user_usage_limit"`
	StartAt           *time.Time `json:"start_at"`
	EndAt             *time.Time `json:"end_at"`
	IsActive          bool       `json:"is_active"`
	Plans             []PlanRef  `json:"plans,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
}

func FromEntity(v *entity.Voucher) *VoucherResponse {
	resp := &VoucherResponse{
		ID:                v.ID,
		Code:              v.Code,
		Name:              v.Name,
		Description:       v.Description,
		DiscountType:      v.DiscountType,
		DiscountValue:     v.DiscountValue,
		MinOrderAmount:    v.MinOrderAmount,
		MaxDiscountAmount: v.MaxDiscountAmount,
		AppliesTo:         v.AppliesTo,
		TotalUsageLimit:   v.TotalUsageLimit,
		PerUserUsageLimit: v.PerUserUsageLimit,
		StartAt:           v.StartAt,
		EndAt:             v.EndAt,
		IsActive:          v.IsActive,
		CreatedAt:         v.CreatedAt,
		UpdatedAt:         v.UpdatedAt,
	}
	if len(v.Plans) > 0 {
		resp.Plans = make([]PlanRef, len(v.Plans))
		for i, p := range v.Plans {
			resp.Plans[i] = PlanRef{ID: p.ID, Name: p.Name, Slug: p.Slug}
		}
	}
	return resp
}

func FromEntities(vs []*entity.Voucher) []*VoucherResponse {
	responses := make([]*VoucherResponse, len(vs))
	for i, v := range vs {
		responses[i] = FromEntity(v)
	}
	return responses
}

// VoucherQuoteResponse is the result of validating a voucher against line items.
type VoucherQuoteResponse struct {
	Valid         bool    `json:"valid"`
	Code          string  `json:"code"`
	Name          string  `json:"name,omitempty"`
	DiscountType  string  `json:"discount_type,omitempty"`
	DiscountValue int64   `json:"discount_value,omitempty"`
	TotalSubtotal int64   `json:"total_subtotal"`
	TotalDiscount int64   `json:"total_discount"`
	TotalAfter    int64   `json:"total_after"`
	DiscountItems []int64 `json:"discount_items"`
	ErrorCode     string  `json:"error_code,omitempty"`
	ErrorMessage  string  `json:"error_message,omitempty"`
}

func FromQuote(res *service.VoucherResult, code string, totalSubtotal int64) *VoucherQuoteResponse {
	resp := &VoucherQuoteResponse{
		Valid:         true,
		Code:          code,
		TotalSubtotal: totalSubtotal,
		TotalDiscount: res.TotalDiscount,
		TotalAfter:    res.TotalAfter,
		DiscountItems: res.DiscountPerItem,
	}
	if res.Voucher != nil {
		resp.Name = res.Voucher.Name
		resp.DiscountType = res.Voucher.DiscountType
		resp.DiscountValue = res.Voucher.DiscountValue
	}
	return resp
}
