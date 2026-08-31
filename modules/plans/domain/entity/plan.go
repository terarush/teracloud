// File: modules/plans/domain/entity/plan.go
package entity

import (
	"encoding/json"
	"time"

	"ruang-tukar/internal/pkg/database"
)

type Plan struct {
	ID                  uint            `gorm:"primaryKey" json:"id"`
	Name                string          `json:"name" gorm:"type:varchar(100);not null"`
	Slug                string          `json:"slug" gorm:"type:varchar(100);uniqueIndex;not null"`
	Description         string          `json:"description" gorm:"type:text"`
	ShortDescription    string          `json:"short_description" gorm:"type:varchar(255)"`
	ImageName           string          `json:"image_name" gorm:"type:varchar(255);not null"`
	ImageTag            string          `json:"image_tag" gorm:"type:varchar(100);not null"`
	ThumbnailURL        *string         `json:"thumbnail_url" gorm:"type:text"`
	Category            string          `json:"category" gorm:"type:varchar(50);default:'os'"`
	Badge               *string         `json:"badge" gorm:"type:varchar(50)"`
	IsFeatured          bool            `json:"is_featured" gorm:"default:false"`
	StockLimit          *int            `json:"stock_limit"`
	CPULimit            float64         `json:"cpu_limit" gorm:"type:decimal(4,2);not null"`
	MemoryLimit         int             `json:"memory_limit" gorm:"not null"`
	DiskLimit           int             `json:"disk_limit" gorm:"not null"`
	BandwidthLimit      *int            `json:"bandwidth_limit"`
	PriceMonthly        int64           `json:"price_monthly" gorm:"not null"`
	IsActive            bool            `json:"is_active" gorm:"default:true"`
	SortOrder           int             `json:"sort_order" gorm:"default:0"`
	Features            json.RawMessage `json:"features" gorm:"type:jsonb;default:'[]'"`
	PortConfig          json.RawMessage `json:"port_config" gorm:"type:jsonb;default:'[]'"`
	EnvironmentTemplate json.RawMessage `json:"environment_template" gorm:"type:jsonb;default:'{}'"`
	Command             *string         `json:"command,omitempty" gorm:"type:text"`
	Entrypoint          *string         `json:"entrypoint,omitempty" gorm:"type:text"`
	Icon                string          `json:"icon" gorm:"type:text"`
	CreatedAt           time.Time       `json:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at"`
	DeletedAt           *time.Time      `json:"deleted_at,omitempty" gorm:"index"`
}

type PortConfigItem struct {
	ContainerPort int    `json:"container_port"`
	Protocol      string `json:"protocol"` // "tcp" or "udp"
	Name          string `json:"name"`     // e.g. "http", "api", "redis", "mysql"
	Description   string `json:"description"`
	IsPrimary     bool   `json:"is_primary"`
}

func (Plan) TableName() string {
	return database.HT("plans")
}
