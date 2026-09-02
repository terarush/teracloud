// File: modules/vouchers/domain/repository/voucher_repository_impl.go
package repository

import (
	"context"
	"errors"

	"teracloud/internal/pkg/database"
	"teracloud/modules/vouchers/domain/entity"

	"gorm.io/gorm"
)

type VoucherRepositoryImpl struct{}

func NewVoucherRepositoryImpl() VoucherRepository {
	return &VoucherRepositoryImpl{}
}

func (r *VoucherRepositoryImpl) Create(ctx context.Context, voucher *entity.Voucher, planIDs []uint) error {
	return database.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(voucher).Error; err != nil {
			return err
		}
		return r.replacePlans(tx, voucher.ID, planIDs)
	})
}

func (r *VoucherRepositoryImpl) Update(ctx context.Context, voucher *entity.Voucher, planIDs []uint) error {
	return database.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(voucher).Error; err != nil {
			return err
		}
		return r.replacePlans(tx, voucher.ID, planIDs)
	})
}

func (r *VoucherRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// delete pivot rows first
		if err := tx.Exec("DELETE FROM "+database.HT("voucher_plans")+" WHERE voucher_id = ?", id).Error; err != nil {
			return err
		}
		return tx.Delete(&entity.Voucher{}, id).Error
	})
}

func (r *VoucherRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Voucher, error) {
	var voucher entity.Voucher
	result := database.DB.WithContext(ctx).
		Preload("Plans").
		First(&voucher, id)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &voucher, nil
}

func (r *VoucherRepositoryImpl) FindByCode(ctx context.Context, code string) (*entity.Voucher, error) {
	var voucher entity.Voucher
	result := database.DB.WithContext(ctx).
		Preload("Plans").
		Where("code = ?", code).
		First(&voucher)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &voucher, nil
}

func (r *VoucherRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Voucher, error) {
	var vouchers []*entity.Voucher
	result := database.DB.WithContext(ctx).
		Preload("Plans").
		Order("created_at DESC").
		Find(&vouchers)
	return vouchers, result.Error
}

func (r *VoucherRepositoryImpl) GetPlanIDs(ctx context.Context, voucherID uint) ([]uint, error) {
	var ids []uint
	err := database.DB.WithContext(ctx).
		Table(database.HT("voucher_plans")).
		Where("voucher_id = ?", voucherID).
		Pluck("plan_id", &ids).Error
	return ids, err
}

func (r *VoucherRepositoryImpl) CountTotalUsage(ctx context.Context, voucherID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Table(database.HT("voucher_usages")).
		Where("voucher_id = ?", voucherID).
		Count(&count).Error
	return count, err
}

func (r *VoucherRepositoryImpl) CountUserUsage(ctx context.Context, voucherID, userID uint) (int64, error) {
	var count int64
	err := database.DB.WithContext(ctx).
		Table(database.HT("voucher_usages")).
		Where("voucher_id = ? AND user_id = ?", voucherID, userID).
		Count(&count).Error
	return count, err
}

func (r *VoucherRepositoryImpl) CreateUsage(ctx context.Context, usage *entity.VoucherUsage) error {
	return database.DB.WithContext(ctx).Create(usage).Error
}

// replacePlans rewrites the voucher_plans pivot rows for a voucher.
// A nil/empty slice means the voucher applies to all plans (no pivot rows).
func (r *VoucherRepositoryImpl) replacePlans(tx *gorm.DB, voucherID uint, planIDs []uint) error {
	if err := tx.Exec("DELETE FROM "+database.HT("voucher_plans")+" WHERE voucher_id = ?", voucherID).Error; err != nil {
		return err
	}
	if len(planIDs) == 0 {
		return nil
	}
	for _, pid := range planIDs {
		if err := tx.Exec("INSERT INTO "+database.HT("voucher_plans")+" (voucher_id, plan_id) VALUES (?, ?)", voucherID, pid).Error; err != nil {
			return err
		}
	}
	return nil
}
