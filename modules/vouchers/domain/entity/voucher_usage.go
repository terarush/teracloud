// File: modules/vouchers/domain/entity/voucher_usage.go
package entity

import (
	"time"

	"teracloud/internal/pkg/database"
)

type VoucherUsage struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	VoucherID      uint      `json:"voucher_id" gorm:"not null;index"`
	UserID         uint      `json:"user_id" gorm:"not null;index"`
	OrderID        *uint     `json:"order_id" gorm:"index"`
	DiscountAmount int64     `json:"discount_amount" gorm:"default:0"`
	CreatedAt      time.Time `json:"created_at"`
}

func (VoucherUsage) TableName() string {
	return database.HT("voucher_usages")
}
