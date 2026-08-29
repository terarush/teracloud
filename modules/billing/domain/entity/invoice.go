// File: modules/billing/domain/entity/invoice.go
package entity

import (
	"encoding/json"
	"time"

	"ruang-tukar/internal/pkg/database"
)

type Invoice struct {
	ID             uint            `gorm:"primaryKey" json:"id"`
	InvoiceNumber  string          `json:"invoice_number" gorm:"type:varchar(50);uniqueIndex;not null"`
	UserID         uint            `json:"user_id" gorm:"not null;index"`
	SubscriptionID *uint           `json:"subscription_id"`
	OrderID        *uint           `json:"order_id"`
	Subtotal       int64           `json:"subtotal" gorm:"not null"`
	Tax            int64           `json:"tax" gorm:"default:0"`
	Total          int64           `json:"total" gorm:"not null"`
	Currency       string          `json:"currency" gorm:"type:varchar(3);default:IDR"`
	Status         string          `json:"status" gorm:"type:varchar(20);default:draft"` // draft, sent, paid, overdue, void
	DueDate        time.Time       `json:"due_date" gorm:"type:date;not null"`
	PaidAt         *time.Time      `json:"paid_at"`
	SentAt         *time.Time      `json:"sent_at"`
	Items          json.RawMessage `json:"items" gorm:"type:jsonb"`
	Notes          string          `json:"notes" gorm:"type:text"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

func (Invoice) TableName() string {
	return database.HT("invoices")
}
