// File: modules/cart/domain/service/cart_service.go
package service

import (
	"context"
	"time"

	"teracloud/modules/cart/domain/entity"
	"teracloud/modules/cart/domain/repository"
	cartErrs "teracloud/modules/cart/errs"
	planRepository "teracloud/modules/plans/domain/repository"
)

type CartService struct {
	cartRepo repository.CartRepository
	planRepo planRepository.PlanRepository
}

func NewCartService(cartRepo repository.CartRepository, planRepo planRepository.PlanRepository) *CartService {
	return &CartService{
		cartRepo: cartRepo,
		planRepo: planRepo,
	}
}

func (s *CartService) GetCart(ctx context.Context, userID uint) ([]*entity.CartItem, error) {
	return s.cartRepo.FindByUserID(ctx, userID)
}

func (s *CartService) AddToCart(ctx context.Context, userID uint, planID uint, customName string, durationMonths int, envConfig []byte) (*entity.CartItem, error) {
	plan, err := s.planRepo.FindByID(ctx, planID)
	if err != nil || !plan.IsActive {
		return nil, cartErrs.ErrPlanNotActive
	}

	if durationMonths <= 0 {
		durationMonths = 1
	}

	existing, err := s.cartRepo.FindByUserAndPlanAndName(ctx, userID, planID, customName)
	if err == nil && existing != nil {
		existing.DurationMonths += durationMonths
		if len(envConfig) > 0 {
			existing.EnvironmentConfig = envConfig
		}
		existing.UpdatedAt = time.Now()
		if err := s.cartRepo.Update(ctx, existing); err != nil {
			return nil, err
		}
		return existing, nil
	}

	item := &entity.CartItem{
		UserID:            userID,
		PlanID:            planID,
		Plan:              plan,
		CustomName:        customName,
		DurationMonths:    durationMonths,
		EnvironmentConfig: envConfig,
		CreatedAt:         time.Now(),
		UpdatedAt:         time.Now(),
	}

	if err := s.cartRepo.Create(ctx, item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *CartService) UpdateCartItem(ctx context.Context, userID uint, itemID uint, customName *string, durationMonths *int, envConfig *[]byte) (*entity.CartItem, error) {
	item, err := s.cartRepo.FindByIDAndUserID(ctx, itemID, userID)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, cartErrs.ErrCartItemNotFound
		}
		return nil, err
	}

	if customName != nil {
		item.CustomName = *customName
	}
	if durationMonths != nil && *durationMonths > 0 {
		item.DurationMonths = *durationMonths
	}
	if envConfig != nil && len(*envConfig) > 0 {
		item.EnvironmentConfig = *envConfig
	}
	item.UpdatedAt = time.Now()

	if err := s.cartRepo.Update(ctx, item); err != nil {
		return nil, err
	}

	return item, nil
}

func (s *CartService) RemoveFromCart(ctx context.Context, userID uint, itemID uint) error {
	return s.cartRepo.Delete(ctx, itemID, userID)
}

func (s *CartService) ClearCart(ctx context.Context, userID uint) error {
	return s.cartRepo.ClearByUserID(ctx, userID)
}
