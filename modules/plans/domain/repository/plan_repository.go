// File: modules/plans/domain/repository/plan_repository.go
package repository

import (
	"context"
	"ruang-tukar/modules/plans/domain/entity"
)

type PlanRepository interface {
	FindAllActive(ctx context.Context) ([]*entity.Plan, error)
	FindAll(ctx context.Context) ([]*entity.Plan, error)
	FindByID(ctx context.Context, id uint) (*entity.Plan, error)
	FindBySlug(ctx context.Context, slug string) (*entity.Plan, error)
	Create(ctx context.Context, plan *entity.Plan) error
	Update(ctx context.Context, plan *entity.Plan) error
	SoftDelete(ctx context.Context, id uint) error
}
