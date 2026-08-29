// File: modules/containers/domain/entity/container_event.go
package entity

import (
	"encoding/json"
	"time"

	"ruang-tukar/internal/pkg/database"
)

type ContainerEvent struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	ContainerID uint            `json:"container_id" gorm:"not null;index"`
	UserID      *uint           `json:"user_id"`
	EventType   string          `json:"event_type" gorm:"type:varchar(30);not null"` // created, started, stopped, restarted, rebooted, reset_soft, reset_hard, rebuilt, suspended, resumed, deleted, error
	Description string          `json:"description" gorm:"type:text"`
	Metadata    json.RawMessage `json:"metadata" gorm:"type:jsonb"`
	IPAddress   string          `json:"ip_address" gorm:"type:varchar(45)"`
	CreatedAt   time.Time       `json:"created_at"`
}

func (ContainerEvent) TableName() string {
	return database.HT("container_events")
}
