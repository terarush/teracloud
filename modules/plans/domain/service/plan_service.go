// File: modules/plans/domain/service/plan_service.go
package service

import (
	"context"
	"strings"

	planErrs "teracloud/modules/plans/errs"
	"teracloud/modules/plans/domain/entity"
	"teracloud/modules/plans/domain/repository"
)

type PlanService struct {
	planRepo repository.PlanRepository
}

func NewPlanService(repo repository.PlanRepository) *PlanService {
	return &PlanService{planRepo: repo}
}

func (s *PlanService) GetActivePlans(ctx context.Context) ([]*entity.Plan, error) {
	return s.planRepo.FindAllActive(ctx)
}

func (s *PlanService) GetAllPlans(ctx context.Context) ([]*entity.Plan, error) {
	return s.planRepo.FindAll(ctx)
}

func (s *PlanService) GetPlanByID(ctx context.Context, id uint) (*entity.Plan, error) {
	plan, err := s.planRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, planErrs.ErrPlanNotFound
		}
		return nil, err
	}
	return plan, nil
}

func (s *PlanService) GetPlanBySlug(ctx context.Context, slug string) (*entity.Plan, error) {
	plan, err := s.planRepo.FindBySlug(ctx, slug)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, planErrs.ErrPlanNotFound
		}
		return nil, err
	}
	return plan, nil
}

func (s *PlanService) CreatePlan(ctx context.Context, plan *entity.Plan) error {
	plan.Slug = generateSlug(plan.Name)

	existing, _ := s.planRepo.FindBySlug(ctx, plan.Slug)
	if existing != nil {
		return planErrs.ErrPlanSlugExists
	}

	return s.planRepo.Create(ctx, plan)
}

func (s *PlanService) UpdatePlan(ctx context.Context, plan *entity.Plan) error {
	_, err := s.planRepo.FindByID(ctx, plan.ID)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return planErrs.ErrPlanNotFound
		}
		return err
	}
	return s.planRepo.Update(ctx, plan)
}

func (s *PlanService) DeletePlan(ctx context.Context, id uint) error {
	_, err := s.planRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return planErrs.ErrPlanNotFound
		}
		return err
	}
	return s.planRepo.SoftDelete(ctx, id)
}

func (s *PlanService) TogglePlan(ctx context.Context, id uint) (*entity.Plan, error) {
	plan, err := s.planRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, planErrs.ErrPlanNotFound
		}
		return nil, err
	}
	plan.IsActive = !plan.IsActive
	if err := s.planRepo.Update(ctx, plan); err != nil {
		return nil, err
	}
	return plan, nil
}

func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	var result strings.Builder
	for _, r := range slug {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '-' {
			result.WriteRune(r)
		}
	}
	return result.String()
}
