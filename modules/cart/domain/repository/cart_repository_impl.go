// File: modules/cart/domain/repository/cart_repository_impl.go
package repository

import (
	"context"
	"errors"

	"teracloud/internal/pkg/database"
	"teracloud/modules/cart/domain/entity"

	"gorm.io/gorm"
)

type CartRepositoryImpl struct {
	db *gorm.DB
}

func NewCartRepository() CartRepository {
	return &CartRepositoryImpl{db: database.DB}
}

func (r *CartRepositoryImpl) FindByUserID(ctx context.Context, userID uint) ([]*entity.CartItem, error) {
	var items []*entity.CartItem
	err := r.db.WithContext(ctx).
		Preload("Plan").
		Where("user_id = ?", userID).
		Order("created_at ASC").
		Find(&items).Error
	return items, err
}

func (r *CartRepositoryImpl) FindByIDAndUserID(ctx context.Context, id uint, userID uint) (*entity.CartItem, error) {
	var item entity.CartItem
	err := r.db.WithContext(ctx).
		Preload("Plan").
		Where("id = ? AND user_id = ?", id, userID).
		First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}
	return &item, nil
}

func (r *CartRepositoryImpl) FindByUserAndPlanAndName(ctx context.Context, userID uint, planID uint, customName string) (*entity.CartItem, error) {
	var item entity.CartItem
	err := r.db.WithContext(ctx).
		Preload("Plan").
		Where("user_id = ? AND plan_id = ? AND custom_name = ?", userID, planID, customName).
		First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrRecordNotFound
		}
		return nil, err
	}
	return &item, nil
}

func (r *CartRepositoryImpl) Create(ctx context.Context, item *entity.CartItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *CartRepositoryImpl) Update(ctx context.Context, item *entity.CartItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *CartRepositoryImpl) Delete(ctx context.Context, id uint, userID uint) error {
	return r.db.WithContext(ctx).
		Where("id = ? AND user_id = ?", id, userID).
		Delete(&entity.CartItem{}).Error
}

func (r *CartRepositoryImpl) ClearByUserID(ctx context.Context, userID uint) error {
	return r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Delete(&entity.CartItem{}).Error
}
