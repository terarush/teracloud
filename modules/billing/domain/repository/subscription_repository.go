// File: modules/billing/domain/repository/subscription_repository.go
package repository

import (
	"context"
	"time"

	"teracloud/modules/billing/domain/entity"
)

type SubscriptionRepository interface {
	FindByID(ctx context.Context, id uint) (*entity.Subscription, error)
	FindByUserID(ctx context.Context, userID uint) ([]*entity.Subscription, error)
	FindAll(ctx context.Context) ([]*entity.Subscription, error)
	FindExpiringActive(ctx context.Context, before time.Time) ([]*entity.Subscription, error)
	FindExpiredGrace(ctx context.Context, now time.Time) ([]*entity.Subscription, error)
	FindSuspendedToTerminate(ctx context.Context, before time.Time) ([]*entity.Subscription, error)
	FindByOrderIDAndPlanID(ctx context.Context, orderID, planID uint) (*entity.Subscription, error)
	Create(ctx context.Context, sub *entity.Subscription) error
	Update(ctx context.Context, sub *entity.Subscription) error
}
