// File: modules/orders/domain/repository/order_repository_impl.go
package repository

import (
	"context"
	"errors"

	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/modules/orders/domain/entity"
)

var ErrRecordNotFound = errors.New("record not found")

type OrderRepositoryImpl struct{}

func NewOrderRepositoryImpl() OrderRepository {
	return &OrderRepositoryImpl{}
}

func (r *OrderRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Order, error) {
	var order entity.Order
	result := database.DB.WithContext(ctx).First(&order, id)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &order, nil
}

func (r *OrderRepositoryImpl) FindByOrderNumber(ctx context.Context, orderNumber string) (*entity.Order, error) {
	var order entity.Order
	result := database.DB.WithContext(ctx).Where("order_number = ?", orderNumber).First(&order)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &order, nil
}

func (r *OrderRepositoryImpl) FindByMidtransOrderID(ctx context.Context, midtransOrderID string) (*entity.Order, error) {
	var order entity.Order
	result := database.DB.WithContext(ctx).Where("midtrans_order_id = ?", midtransOrderID).First(&order)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &order, nil
}

func (r *OrderRepositoryImpl) FindByUserID(ctx context.Context, userID uint) ([]*entity.Order, error) {
	var orders []*entity.Order
	result := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&orders)
	return orders, result.Error
}

func (r *OrderRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Order, error) {
	var orders []*entity.Order
	result := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Find(&orders)
	return orders, result.Error
}

func (r *OrderRepositoryImpl) Create(ctx context.Context, order *entity.Order) error {
	return database.DB.WithContext(ctx).Create(order).Error
}

func (r *OrderRepositoryImpl) Update(ctx context.Context, order *entity.Order) error {
	return database.DB.WithContext(ctx).Save(order).Error
}

func (r *OrderRepositoryImpl) CountActiveByUserIDAndPlanID(ctx context.Context, userID, planID uint) (int64, error) {
	var count int64
	// Count active subscriptions for this user and plan
	err := database.DB.WithContext(ctx).
		Table(database.HT("subscriptions")).
		Where("user_id = ? AND plan_id = ? AND status IN ('active', 'grace_period', 'provisioning')", userID, planID).
		Count(&count).Error
	return count, err
}
