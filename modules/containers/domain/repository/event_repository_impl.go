// File: modules/containers/domain/repository/event_repository_impl.go
package repository

import (
	"context"

	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/modules/containers/domain/entity"
)

type EventRepositoryImpl struct{}

func NewEventRepositoryImpl() EventRepository {
	return &EventRepositoryImpl{}
}

func (r *EventRepositoryImpl) Create(ctx context.Context, event *entity.ContainerEvent) error {
	return database.DB.WithContext(ctx).Create(event).Error
}

func (r *EventRepositoryImpl) FindByContainerID(ctx context.Context, containerID uint) ([]*entity.ContainerEvent, error) {
	var events []*entity.ContainerEvent
	result := database.DB.WithContext(ctx).
		Where("container_id = ?", containerID).
		Order("created_at DESC").
		Limit(50).
		Find(&events)
	return events, result.Error
}
