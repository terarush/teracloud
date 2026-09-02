// File: modules/vouchers/domain/repository/voucher_repository.go
package repository

import (
	"context"
	"errors"

	"teracloud/modules/vouchers/domain/entity"
)

var ErrRecordNotFound = errors.New("record not found")

type VoucherRepository interface {
	Create(ctx context.Context, voucher *entity.Voucher, planIDs []uint) error
	Update(ctx context.Context, voucher *entity.Voucher, planIDs []uint) error
	Delete(ctx context.Context, id uint) error
	FindByID(ctx context.Context, id uint) (*entity.Voucher, error)
	FindByCode(ctx context.Context, code string) (*entity.Voucher, error)
	FindAll(ctx context.Context) ([]*entity.Voucher, error)
	GetPlanIDs(ctx context.Context, voucherID uint) ([]uint, error)
	CountTotalUsage(ctx context.Context, voucherID uint) (int64, error)
	CountUserUsage(ctx context.Context, voucherID, userID uint) (int64, error)
	CreateUsage(ctx context.Context, usage *entity.VoucherUsage) error
}
