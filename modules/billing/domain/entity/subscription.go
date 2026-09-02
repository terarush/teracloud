// File: modules/billing/domain/entity/subscription.go
package entity

import (
	"encoding/json"
	"time"

	"teracloud/internal/pkg/database"
)

type Subscription struct {
	ID             uint            `gorm:"primaryKey" json:"id"`
	UserID         uint            `json:"user_id" gorm:"not null;index"`
	PlanID         uint            `json:"plan_id" gorm:"not null"`
	ContainerID    *uint           `json:"container_id" gorm:"index"`
	CurrentOrderID *uint           `json:"current_order_id" gorm:"index"`
	Status         string          `json:"status" gorm:"type:varchar(20);default:provisioning;index"` // provisioning, active, grace_period, suspended, terminated
	PeriodStart    time.Time       `json:"period_start" gorm:"not null"`
	PeriodEnd      time.Time       `json:"period_end" gorm:"not null;index"`
	GracePeriodEnd *time.Time      `json:"grace_period_end"`
	SuspendedAt    *time.Time      `json:"suspended_at"`
	TerminatedAt   *time.Time      `json:"terminated_at"`
	AutoRenew      bool            `json:"auto_renew" gorm:"default:true"`
	RemindersSent  json.RawMessage `json:"reminders_sent" gorm:"type:jsonb;default:'{}'"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

func (Subscription) TableName() string {
	return database.HT("subscriptions")
}
