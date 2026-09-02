// File: modules/cart/domain/entity/cart_item.go
package entity

import (
	"encoding/json"
	"time"

	"teracloud/internal/pkg/database"
	planEntity "teracloud/modules/plans/domain/entity"
)

type CartItem struct {
	ID                uint                 `gorm:"primaryKey" json:"id"`
	UserID            uint                 `json:"user_id" gorm:"not null;index"`
	PlanID            uint                 `json:"plan_id" gorm:"not null;index"`
	Plan              *planEntity.Plan     `json:"plan,omitempty" gorm:"foreignKey:PlanID"`
	CustomName        string               `json:"custom_name" gorm:"type:varchar(100)"`
	DurationMonths    int                  `json:"duration_months" gorm:"default:1;not null"`
	EnvironmentConfig json.RawMessage      `json:"environment_config" gorm:"type:jsonb;default:'{}'"`
	CreatedAt         time.Time            `json:"created_at"`
	UpdatedAt         time.Time            `json:"updated_at"`
}

func (CartItem) TableName() string {
	return database.HT("cart_items")
}
