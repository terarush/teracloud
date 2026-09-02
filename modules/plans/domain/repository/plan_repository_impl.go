// File: modules/plans/domain/repository/plan_repository_impl.go
package repository

import (
	"context"
	"errors"
	"time"

	"teracloud/internal/pkg/database"
	"teracloud/modules/plans/domain/entity"
)

var ErrRecordNotFound = errors.New("record not found")

type PlanRepositoryImpl struct{}

func NewPlanRepositoryImpl() PlanRepository {
	return &PlanRepositoryImpl{}
}

func (r *PlanRepositoryImpl) FindAllActive(ctx context.Context) ([]*entity.Plan, error) {
	var plans []*entity.Plan
	result := database.DB.WithContext(ctx).
		Where("is_active = ? AND deleted_at IS NULL", true).
		Order("sort_order ASC, created_at ASC").
		Find(&plans)
	return plans, result.Error
}

func (r *PlanRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Plan, error) {
	var plans []*entity.Plan
	result := database.DB.WithContext(ctx).
		Where("deleted_at IS NULL").
		Order("sort_order ASC, created_at ASC").
		Find(&plans)
	return plans, result.Error
}

func (r *PlanRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Plan, error) {
	var plan entity.Plan
	result := database.DB.WithContext(ctx).
		Where("deleted_at IS NULL").
		First(&plan, id)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &plan, nil
}

func (r *PlanRepositoryImpl) FindBySlug(ctx context.Context, slug string) (*entity.Plan, error) {
	var plan entity.Plan
	result := database.DB.WithContext(ctx).
		Where("slug = ? AND deleted_at IS NULL", slug).
		First(&plan)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &plan, nil
}

func (r *PlanRepositoryImpl) Create(ctx context.Context, plan *entity.Plan) error {
	return database.DB.WithContext(ctx).Create(plan).Error
}

func (r *PlanRepositoryImpl) Update(ctx context.Context, plan *entity.Plan) error {
	return database.DB.WithContext(ctx).Save(plan).Error
}

func (r *PlanRepositoryImpl) SoftDelete(ctx context.Context, id uint) error {
	now := time.Now()
	return database.DB.WithContext(ctx).
		Model(&entity.Plan{}).
		Where("id = ?", id).
		Update("deleted_at", now).Error
}
