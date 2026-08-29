// File: modules/orders/domain/entity/order_item.go
package entity

import (
	"encoding/json"
	"time"

	"ruang-tukar/internal/pkg/database"
	planEntity "ruang-tukar/modules/plans/domain/entity"
)

type OrderItem struct {
	ID                 uint             `gorm:"primaryKey" json:"id"`
	OrderID            uint             `json:"order_id" gorm:"not null;index"`
	PlanID             uint             `json:"plan_id" gorm:"not null;index"`
	Plan               *planEntity.Plan `json:"plan,omitempty" gorm:"foreignKey:PlanID"`
	SubscriptionID     *uint            `json:"subscription_id" gorm:"index"`
	CustomName         string           `json:"custom_name" gorm:"type:varchar(100)"`
	DurationMonths     int              `json:"duration_months" gorm:"default:1;not null"`
	UnitPrice          int64            `json:"unit_price" gorm:"not null"`
	Subtotal           int64            `json:"subtotal" gorm:"not null"`
	EnvironmentConfig  json.RawMessage  `json:"environment_config" gorm:"type:jsonb;default:'{}'"`
	ProvisioningStatus string           `json:"provisioning_status" gorm:"type:varchar(20);default:'pending'"` // pending, provisioning, completed, failed
	ErrorMessage       *string          `json:"error_message" gorm:"type:text"`
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
}

func (OrderItem) TableName() string {
	return database.HT("order_items")
}
