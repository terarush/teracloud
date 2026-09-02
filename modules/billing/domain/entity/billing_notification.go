// File: modules/billing/domain/entity/billing_notification.go
package entity

import (
	"time"

	"teracloud/internal/pkg/database"
)

type BillingNotification struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	SubscriptionID   uint      `json:"subscription_id" gorm:"not null;index"`
	UserID           uint      `json:"user_id" gorm:"not null"`
	NotificationType string    `json:"notification_type" gorm:"type:varchar(30);not null;index"`
	EmailTo          string    `json:"email_to" gorm:"type:varchar(255);not null"`
	EmailSubject     string    `json:"email_subject" gorm:"type:varchar(255);not null"`
	SentAt           time.Time `json:"sent_at" gorm:"not null"`
	Error            string    `json:"error,omitempty" gorm:"type:text"`
	CreatedAt        time.Time `json:"created_at"`
}

func (BillingNotification) TableName() string {
	return database.HT("billing_notifications")
}
