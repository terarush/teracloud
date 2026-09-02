// File: modules/containers/domain/repository/container_repository_impl.go
package repository

import (
	"context"
	"errors"
	"time"

	"teracloud/internal/pkg/database"
	"teracloud/modules/containers/domain/entity"
)

var ErrRecordNotFound = errors.New("record not found")

type ContainerRepositoryImpl struct{}

func NewContainerRepositoryImpl() ContainerRepository {
	return &ContainerRepositoryImpl{}
}

func (r *ContainerRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Container, error) {
	var container entity.Container
	result := database.DB.WithContext(ctx).
		Where("deleted_at IS NULL").
		First(&container, id)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &container, nil
}

func (r *ContainerRepositoryImpl) FindByDockerID(ctx context.Context, dockerID string) (*entity.Container, error) {
	var container entity.Container
	result := database.DB.WithContext(ctx).
		Where("docker_container_id = ? AND deleted_at IS NULL", dockerID).
		First(&container)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &container, nil
}

func (r *ContainerRepositoryImpl) FindBySubscriptionID(ctx context.Context, subscriptionID uint) (*entity.Container, error) {
	var container entity.Container
	result := database.DB.WithContext(ctx).
		Where("subscription_id = ? AND deleted_at IS NULL", subscriptionID).
		First(&container)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &container, nil
}

func (r *ContainerRepositoryImpl) FindByUserID(ctx context.Context, userID uint) ([]*entity.Container, error) {
	var containers []*entity.Container
	result := database.DB.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Order("created_at DESC").
		Find(&containers)
	return containers, result.Error
}

func (r *ContainerRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Container, error) {
	var containers []*entity.Container
	result := database.DB.WithContext(ctx).
		Where("deleted_at IS NULL").
		Order("created_at DESC").
		Find(&containers)
	return containers, result.Error
}

func (r *ContainerRepositoryImpl) Create(ctx context.Context, container *entity.Container) error {
	return database.DB.WithContext(ctx).Create(container).Error
}

func (r *ContainerRepositoryImpl) Update(ctx context.Context, container *entity.Container) error {
	return database.DB.WithContext(ctx).Save(container).Error
}

func (r *ContainerRepositoryImpl) SoftDelete(ctx context.Context, id uint) error {
	now := time.Now()
	return database.DB.WithContext(ctx).
		Model(&entity.Container{}).
		Where("id = ?", id).
		Update("deleted_at", now).Error
}
