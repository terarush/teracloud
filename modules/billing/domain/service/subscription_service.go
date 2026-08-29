// File: modules/billing/domain/service/subscription_service.go
package service

import (
	"context"
	"time"

	billingErrs "ruang-tukar/modules/billing/errs"
	"ruang-tukar/modules/billing/domain/entity"
	"ruang-tukar/modules/billing/domain/repository"
)

type SubscriptionService struct {
	subRepo repository.SubscriptionRepository
}

func NewSubscriptionService(repo repository.SubscriptionRepository) *SubscriptionService {
	return &SubscriptionService{subRepo: repo}
}

func (s *SubscriptionService) CreateSubscription(
	ctx context.Context,
	userID, planID, orderID uint,
) (*entity.Subscription, error) {
	now := time.Now()
	periodEnd := now.Add(30 * 24 * time.Hour) // 30 days
	graceEnd := periodEnd.Add(3 * 24 * time.Hour) // +3 days grace

	sub := &entity.Subscription{
		UserID:         userID,
		PlanID:         planID,
		CurrentOrderID: &orderID,
		Status:         "provisioning",
		PeriodStart:    now,
		PeriodEnd:      periodEnd,
		GracePeriodEnd: &graceEnd,
		AutoRenew:      true,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if err := s.subRepo.Create(ctx, sub); err != nil {
		return nil, err
	}

	return sub, nil
}

func (s *SubscriptionService) GetUserSubscriptions(ctx context.Context, userID uint) ([]*entity.Subscription, error) {
	return s.subRepo.FindByUserID(ctx, userID)
}

func (s *SubscriptionService) GetSubscriptionByID(ctx context.Context, id uint) (*entity.Subscription, error) {
	sub, err := s.subRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, billingErrs.ErrSubscriptionNotFound
		}
		return nil, err
	}
	return sub, nil
}

func (s *SubscriptionService) GetAllSubscriptions(ctx context.Context) ([]*entity.Subscription, error) {
	return s.subRepo.FindAll(ctx)
}

func (s *SubscriptionService) SetContainerID(ctx context.Context, subID, containerID uint) error {
	sub, err := s.subRepo.FindByID(ctx, subID)
	if err != nil {
		return err
	}
	sub.ContainerID = &containerID
	sub.Status = "active"
	sub.UpdatedAt = time.Now()
	return s.subRepo.Update(ctx, sub)
}
