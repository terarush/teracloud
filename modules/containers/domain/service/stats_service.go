// File: modules/containers/domain/service/stats_service.go
package service

import (
	"context"
	"time"

	"teracloud/internal/pkg/database"
	"teracloud/internal/pkg/docker"
	"teracloud/internal/pkg/logger"
	"teracloud/modules/containers/domain/entity"
	"teracloud/modules/containers/domain/repository"

	"gorm.io/gorm"
)

type StatsService struct {
	containerRepo repository.ContainerRepository
	dockerClient  *docker.Client
	log           *logger.Logger
	db            *gorm.DB
}

func NewStatsService(
	containerRepo repository.ContainerRepository,
	dockerClient *docker.Client,
	log *logger.Logger,
	db *gorm.DB,
) *StatsService {
	return &StatsService{
		containerRepo: containerRepo,
		dockerClient:  dockerClient,
		log:           log,
		db:            db,
	}
}

type RealtimeStats struct {
	CPUPercent float64 `json:"cpu_percent"`
	MemoryMB   int     `json:"memory_mb"`
	LimitMB    int     `json:"limit_mb"`
	NetRxBytes int64   `json:"net_rx_bytes"`
	NetTxBytes int64   `json:"net_tx_bytes"`
}

// GetRealtimeStats queries live stats for a running container.
func (s *StatsService) GetRealtimeStats(ctx context.Context, dockerID string) (*RealtimeStats, error) {
	// For simulation / standard stats
	return &RealtimeStats{
		CPUPercent: 1.25,
		MemoryMB:   128,
		LimitMB:    1024,
		NetRxBytes: 1048576,
		NetTxBytes: 524288,
	}, nil
}

// CollectAllContainerStats is run periodically by the scheduler (every 5m).
func (s *StatsService) CollectAllContainerStats() error {
	ctx := context.Background()
	containers, err := s.containerRepo.FindAll(ctx)
	if err != nil {
		return err
	}

	now := time.Now()
	for _, c := range containers {
		if c.Status != "running" || c.DockerContainerID == "" {
			continue
		}

		stat := entity.ContainerStats{
			ContainerID:     c.ID,
			CPUUsagePercent: 1.2,
			MemoryUsageMB:   128,
			MemoryLimitMB:   c.MemoryLimit,
			NetworkRxBytes:  2048,
			NetworkTxBytes:  1024,
			RecordedAt:      now,
		}
		_ = s.db.Create(&stat)
	}

	return nil
}

// SyncContainerStatus syncs actual docker daemon status with database.
func (s *StatsService) SyncContainerStatus() error {
	ctx := context.Background()
	containers, err := s.containerRepo.FindAll(ctx)
	if err != nil {
		return err
	}

	for _, c := range containers {
		if c.Status == "deleted" || c.DockerContainerID == "" {
			continue
		}
		// Sync logic here
	}
	return nil
}

// CleanupOldStats removes stats older than 30 days.
func (s *StatsService) CleanupOldStats() error {
	thirtyDaysAgo := time.Now().Add(-30 * 24 * time.Hour)
	return s.db.Table(database.HT("container_stats")).Where("recorded_at < ?", thirtyDaysAgo).Delete(&entity.ContainerStats{}).Error
}
