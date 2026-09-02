// File: modules/containers/domain/entity/container.go
package entity

import (
	"encoding/json"
	"time"

	"teracloud/internal/pkg/database"
)

type Container struct {
	ID                uint            `gorm:"primaryKey" json:"id"`
	UserID            uint            `json:"user_id" gorm:"not null;index"`
	SubscriptionID    uint            `json:"subscription_id" gorm:"not null;index"`
	PlanID            uint            `json:"plan_id" gorm:"not null"`
	DockerContainerID string          `json:"docker_container_id" gorm:"type:varchar(100)"`
	ContainerName     string          `json:"container_name" gorm:"type:varchar(100);uniqueIndex;not null"`
	Hostname          string          `json:"hostname" gorm:"type:varchar(100)"`
	ImageName         string          `json:"image_name" gorm:"type:varchar(255);not null"`
	ImageTag          string          `json:"image_tag" gorm:"type:varchar(100);not null"`
	Status            string          `json:"status" gorm:"type:varchar(20);default:creating;index"` // creating, running, stopped, suspended, error, deleted
	CPULimit          float64         `json:"cpu_limit" gorm:"type:decimal(4,2);not null"`
	MemoryLimit       int             `json:"memory_limit" gorm:"not null"`
	DiskLimit         int             `json:"disk_limit" gorm:"not null"`
	VolumePath        string          `json:"volume_path" gorm:"type:text"`
	PortMappings      json.RawMessage `json:"port_mappings" gorm:"type:jsonb"`
	AssignedPorts     json.RawMessage `json:"assigned_ports" gorm:"type:jsonb"`
	TunnelRoutes      json.RawMessage `json:"tunnel_routes" gorm:"type:jsonb;default:'[]'"`
	InternalIP        string          `json:"internal_ip" gorm:"type:varchar(45)"`
	LastStartedAt     *time.Time      `json:"last_started_at"`
	LastStoppedAt     *time.Time      `json:"last_stopped_at"`
	ErrorMessage      string          `json:"error_message" gorm:"type:text"`
	CreatedAt         time.Time       `json:"created_at"`
	UpdatedAt         time.Time       `json:"updated_at"`
	DeletedAt         *time.Time      `json:"deleted_at,omitempty" gorm:"index"`
}

func (Container) TableName() string {
	return database.HT("containers")
}
