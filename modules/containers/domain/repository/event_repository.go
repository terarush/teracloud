// File: modules/containers/domain/repository/event_repository.go
package repository

import (
	"context"
	"ruang-tukar/modules/containers/domain/entity"
)

type EventRepository interface {
	Create(ctx context.Context, event *entity.ContainerEvent) error
	FindByContainerID(ctx context.Context, containerID uint) ([]*entity.ContainerEvent, error)
}
