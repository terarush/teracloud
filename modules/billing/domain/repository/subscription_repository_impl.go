// File: modules/billing/domain/repository/subscription_repository_impl.go
package repository

import (
	"context"
	"errors"
	"time"

	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/modules/billing/domain/entity"
)

var ErrRecordNotFound = errors.New("record not found")

type SubscriptionRepositoryImpl struct{}

func NewSubscriptionRepositoryImpl() SubscriptionRepository {
	return &SubscriptionRepositoryImpl{}
}

func (r *SubscriptionRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Subscription, error) {
	var sub entity.Subscription
	result := database.DB.WithContext(ctx).First(&sub, id)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &sub, nil
}

func (r *SubscriptionRepositoryImpl) FindByUserID(ctx context.Context, userID uint) ([]*entity.Subscription, error) {
	var subs []*entity.Subscription
	result := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&subs)
	return subs, result.Error
}

func (r *SubscriptionRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Subscription, error) {
	var subs []*entity.Subscription
	result := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Find(&subs)
	return subs, result.Error
}

func (r *SubscriptionRepositoryImpl) FindExpiringActive(ctx context.Context, before time.Time) ([]*entity.Subscription, error) {
	var subs []*entity.Subscription
	result := database.DB.WithContext(ctx).
		Where("status = 'active' AND period_end <= ?", before).
		Find(&subs)
	return subs, result.Error
}

func (r *SubscriptionRepositoryImpl) FindExpiredGrace(ctx context.Context, now time.Time) ([]*entity.Subscription, error) {
	var subs []*entity.Subscription
	result := database.DB.WithContext(ctx).
		Where("status = 'grace_period' AND grace_period_end <= ?", now).
		Find(&subs)
	return subs, result.Error
}

func (r *SubscriptionRepositoryImpl) FindSuspendedToTerminate(ctx context.Context, before time.Time) ([]*entity.Subscription, error) {
	var subs []*entity.Subscription
	result := database.DB.WithContext(ctx).
		Where("status = 'suspended' AND suspended_at <= ?", before).
		Find(&subs)
	return subs, result.Error
}

func (r *SubscriptionRepositoryImpl) FindByOrderIDAndPlanID(ctx context.Context, orderID, planID uint) (*entity.Subscription, error) {
	var sub entity.Subscription
	result := database.DB.WithContext(ctx).
		Where("current_order_id = ? AND plan_id = ?", orderID, planID).
		First(&sub)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &sub, nil
}

func (r *SubscriptionRepositoryImpl) Create(ctx context.Context, sub *entity.Subscription) error {
	return database.DB.WithContext(ctx).Create(sub).Error
}

func (r *SubscriptionRepositoryImpl) Update(ctx context.Context, sub *entity.Subscription) error {
	return database.DB.WithContext(ctx).Save(sub).Error
}
