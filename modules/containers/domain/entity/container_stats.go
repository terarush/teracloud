// File: modules/containers/domain/entity/container_stats.go
package entity

import (
	"time"

	"ruang-tukar/internal/pkg/database"
)

type ContainerStats struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	ContainerID      uint      `json:"container_id" gorm:"not null;index"`
	CPUUsagePercent  float64   `json:"cpu_usage_percent" gorm:"type:decimal(5,2)"`
	MemoryUsageMB    int       `json:"memory_usage_mb"`
	MemoryLimitMB    int       `json:"memory_limit_mb"`
	NetworkRxBytes   int64     `json:"network_rx_bytes"`
	NetworkTxBytes   int64     `json:"network_tx_bytes"`
	DiskUsageBytes   int64     `json:"disk_usage_bytes"`
	RecordedAt       time.Time `json:"recorded_at"`
}

func (ContainerStats) TableName() string {
	return database.HT("container_stats")
}
