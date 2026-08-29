// File: modules/orders/domain/repository/order_repository.go
package repository

import (
	"context"
	"ruang-tukar/modules/orders/domain/entity"
)

type OrderRepository interface {
	FindByID(ctx context.Context, id uint) (*entity.Order, error)
	FindByOrderNumber(ctx context.Context, orderNumber string) (*entity.Order, error)
	FindByMidtransOrderID(ctx context.Context, midtransOrderID string) (*entity.Order, error)
	FindByUserID(ctx context.Context, userID uint) ([]*entity.Order, error)
	FindAll(ctx context.Context) ([]*entity.Order, error)
	Create(ctx context.Context, order *entity.Order) error
	CreateWithItems(ctx context.Context, order *entity.Order, items []*entity.OrderItem) error
	Update(ctx context.Context, order *entity.Order) error
	UpdateOrderItem(ctx context.Context, item *entity.OrderItem) error
	FindOrderItemsByOrderID(ctx context.Context, orderID uint) ([]*entity.OrderItem, error)
	CountActiveByUserIDAndPlanID(ctx context.Context, userID, planID uint) (int64, error)
}
