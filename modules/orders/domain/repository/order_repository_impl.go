// File: modules/orders/domain/repository/order_repository_impl.go
package repository

import (
	"context"
	"errors"

	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/modules/orders/domain/entity"

	"gorm.io/gorm"
)

var ErrRecordNotFound = errors.New("record not found")

type OrderRepositoryImpl struct{}

func NewOrderRepositoryImpl() OrderRepository {
	return &OrderRepositoryImpl{}
}

func (r *OrderRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Order, error) {
	var order entity.Order
	result := database.DB.WithContext(ctx).
		Preload("Items").
		Preload("Items.Plan").
		First(&order, id)
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
	result := database.DB.WithContext(ctx).
		Preload("Items").
		Preload("Items.Plan").
		Where("order_number = ?", orderNumber).
		First(&order)
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
	result := database.DB.WithContext(ctx).
		Preload("Items").
		Preload("Items.Plan").
		Where("midtrans_order_id = ?", midtransOrderID).
		First(&order)
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
		Preload("Items").
		Preload("Items.Plan").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&orders)
	return orders, result.Error
}

func (r *OrderRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Order, error) {
	var orders []*entity.Order
	result := database.DB.WithContext(ctx).
		Preload("Items").
		Preload("Items.Plan").
		Order("created_at DESC").
		Find(&orders)
	return orders, result.Error
}

func (r *OrderRepositoryImpl) Create(ctx context.Context, order *entity.Order) error {
	return database.DB.WithContext(ctx).Create(order).Error
}

func (r *OrderRepositoryImpl) CreateWithItems(ctx context.Context, order *entity.Order, items []*entity.OrderItem) error {
	return database.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(order).Error; err != nil {
			return err
		}
		for _, item := range items {
			item.OrderID = order.ID
			if err := tx.Create(item).Error; err != nil {
				return err
			}
		}
		order.Items = items
		return nil
	})
}

func (r *OrderRepositoryImpl) Update(ctx context.Context, order *entity.Order) error {
	return database.DB.WithContext(ctx).Save(order).Error
}

func (r *OrderRepositoryImpl) UpdateOrderItem(ctx context.Context, item *entity.OrderItem) error {
	return database.DB.WithContext(ctx).Save(item).Error
}

func (r *OrderRepositoryImpl) FindOrderItemsByOrderID(ctx context.Context, orderID uint) ([]*entity.OrderItem, error) {
	var items []*entity.OrderItem
	err := database.DB.WithContext(ctx).
		Preload("Plan").
		Where("order_id = ?", orderID).
		Find(&items).Error
	return items, err
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
