// File: modules/cart/domain/repository/cart_repository.go
package repository

import (
	"context"
	"errors"

	"teracloud/modules/cart/domain/entity"
)

var ErrRecordNotFound = errors.New("record not found")

type CartRepository interface {
	FindByUserID(ctx context.Context, userID uint) ([]*entity.CartItem, error)
	FindByIDAndUserID(ctx context.Context, id uint, userID uint) (*entity.CartItem, error)
	FindByUserAndPlanAndName(ctx context.Context, userID uint, planID uint, customName string) (*entity.CartItem, error)
	Create(ctx context.Context, item *entity.CartItem) error
	Update(ctx context.Context, item *entity.CartItem) error
	Delete(ctx context.Context, id uint, userID uint) error
	ClearByUserID(ctx context.Context, userID uint) error
}
