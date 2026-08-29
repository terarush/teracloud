// File: modules/containers/domain/repository/container_repository.go
package repository

import (
	"context"
	"ruang-tukar/modules/containers/domain/entity"
)

type ContainerRepository interface {
	FindByID(ctx context.Context, id uint) (*entity.Container, error)
	FindByDockerID(ctx context.Context, dockerID string) (*entity.Container, error)
	FindBySubscriptionID(ctx context.Context, subscriptionID uint) (*entity.Container, error)
	FindByUserID(ctx context.Context, userID uint) ([]*entity.Container, error)
	FindAll(ctx context.Context) ([]*entity.Container, error)
	Create(ctx context.Context, container *entity.Container) error
	Update(ctx context.Context, container *entity.Container) error
	SoftDelete(ctx context.Context, id uint) error
}
