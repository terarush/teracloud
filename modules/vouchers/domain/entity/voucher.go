// File: modules/vouchers/domain/entity/voucher.go
package entity

import (
	"time"

	"teracloud/internal/pkg/database"
	planEntity "teracloud/modules/plans/domain/entity"
)

const (
	DiscountTypePercentage = "percentage"
	DiscountTypeFixed      = "fixed_amount"
	AppliesToAll           = "all"
	AppliesToSpecificPlans = "specific_plans"
)

type Voucher struct {
	ID                uint               `gorm:"primaryKey" json:"id"`
	Code              string             `json:"code" gorm:"type:varchar(50);uniqueIndex;not null"`
	Name              string             `json:"name" gorm:"type:varchar(100)"`
	Description       string             `json:"description" gorm:"type:text"`
	DiscountType      string             `json:"discount_type" gorm:"type:varchar(20);not null"`
	DiscountValue     int64              `json:"discount_value" gorm:"not null"`
	MinOrderAmount    int64              `json:"min_order_amount" gorm:"default:0"`
	MaxDiscountAmount *int64             `json:"max_discount_amount"`
	AppliesTo         string             `json:"applies_to" gorm:"type:varchar(20);default:'all'"`
	TotalUsageLimit   *int               `json:"total_usage_limit"`
	PerUserUsageLimit *int               `json:"per_user_usage_limit"`
	StartAt           *time.Time         `json:"start_at"`
	EndAt             *time.Time         `json:"end_at"`
	IsActive          bool               `json:"is_active" gorm:"default:true"`
	Plans             []*planEntity.Plan `json:"plans,omitempty" gorm:"many2many:hosting.voucher_plans;"`
	CreatedAt         time.Time          `json:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at"`
}

func (Voucher) TableName() string {
	return database.HT("vouchers")
}
