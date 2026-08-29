// File: modules/orders/domain/entity/order.go
package entity

import (
	"encoding/json"
	"time"

	"ruang-tukar/internal/pkg/database"
)

type Order struct {
	ID                    uint            `gorm:"primaryKey" json:"id"`
	OrderNumber           string          `json:"order_number" gorm:"type:varchar(50);uniqueIndex;not null"`
	UserID                uint            `json:"user_id" gorm:"not null;index"`
	PlanID                uint            `json:"plan_id" gorm:"not null"`
	SubscriptionID        *uint           `json:"subscription_id" gorm:"index"`
	OrderType             string          `json:"order_type" gorm:"type:varchar(20);not null"` // 'new_purchase', 'renewal', 'upgrade'
	Amount                int64           `json:"amount" gorm:"not null"`
	Currency              string          `json:"currency" gorm:"type:varchar(3);default:IDR"`
	Status                string          `json:"status" gorm:"type:varchar(20);default:pending;index"` // pending, awaiting_payment, paid, failed, expired
	MidtransOrderID       string          `json:"midtrans_order_id" gorm:"type:varchar(100);uniqueIndex"`
	MidtransTransactionID string          `json:"midtrans_transaction_id" gorm:"type:varchar(100)"`
	MidtransPaymentType   string          `json:"midtrans_payment_type" gorm:"type:varchar(50)"`
	MidtransVANumber      string          `json:"midtrans_va_number" gorm:"type:varchar(100)"`
	SnapToken             string          `json:"snap_token" gorm:"type:text"`
	SnapRedirectURL       string          `json:"snap_redirect_url" gorm:"type:text"`
	PaidAt                *time.Time      `json:"paid_at"`
	ExpiredAt             *time.Time      `json:"expired_at"`
	Metadata              json.RawMessage `json:"metadata" gorm:"type:jsonb"`
	CreatedAt             time.Time       `json:"created_at"`
	UpdatedAt             time.Time       `json:"updated_at"`
}

func (Order) TableName() string {
	return database.HT("orders")
}
