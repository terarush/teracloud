// File: modules/billing/domain/service/scheduler_service.go
package service

import (
	"context"
	"time"

	"teracloud/internal/pkg/logger"
	"teracloud/modules/billing/domain/repository"
)

type BillingSchedulerService struct {
	subRepo     repository.SubscriptionRepository
	reminderSvc *ReminderService
	log         *logger.Logger
}

func NewBillingSchedulerService(
	subRepo repository.SubscriptionRepository,
	reminderSvc *ReminderService,
	log *logger.Logger,
) *BillingSchedulerService {
	return &BillingSchedulerService{
		subRepo:     subRepo,
		reminderSvc: reminderSvc,
		log:         log,
	}
}

// CheckExpiringSubscriptions checks active subscriptions and handles grace periods.
func (s *BillingSchedulerService) CheckExpiringSubscriptions() error {
	ctx := context.Background()
	now := time.Now()

	// 1. Find subscriptions whose period ended -> move to grace_period
	expiring, err := s.subRepo.FindExpiringActive(ctx, now)
	if err != nil {
		return err
	}

	for _, sub := range expiring {
		s.log.Info("Subscription %d expired, moving to grace period", sub.ID)
		sub.Status = "grace_period"
		graceEnd := sub.PeriodEnd.Add(3 * 24 * time.Hour)
		sub.GracePeriodEnd = &graceEnd
		sub.UpdatedAt = now
		_ = s.subRepo.Update(ctx, sub)
	}

	// 2. Find subscriptions whose grace period ended -> move to suspended
	expiredGrace, err := s.subRepo.FindExpiredGrace(ctx, now)
	if err != nil {
		return err
	}

	for _, sub := range expiredGrace {
		s.log.Info("Subscription %d grace period ended, suspending", sub.ID)
		sub.Status = "suspended"
		sub.SuspendedAt = &now
		sub.UpdatedAt = now
		_ = s.subRepo.Update(ctx, sub)
	}

	return nil
}
