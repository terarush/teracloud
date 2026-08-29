// File: modules/billing/domain/repository/invoice_repository_impl.go
package repository

import (
	"context"

	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/modules/billing/domain/entity"
)

type InvoiceRepositoryImpl struct{}

func NewInvoiceRepositoryImpl() InvoiceRepository {
	return &InvoiceRepositoryImpl{}
}

func (r *InvoiceRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.Invoice, error) {
	var inv entity.Invoice
	result := database.DB.WithContext(ctx).First(&inv, id)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ErrRecordNotFound
		}
		return nil, result.Error
	}
	return &inv, nil
}

func (r *InvoiceRepositoryImpl) FindByUserID(ctx context.Context, userID uint) ([]*entity.Invoice, error) {
	var invoices []*entity.Invoice
	result := database.DB.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&invoices)
	return invoices, result.Error
}

func (r *InvoiceRepositoryImpl) FindAll(ctx context.Context) ([]*entity.Invoice, error) {
	var invoices []*entity.Invoice
	result := database.DB.WithContext(ctx).
		Order("created_at DESC").
		Find(&invoices)
	return invoices, result.Error
}

func (r *InvoiceRepositoryImpl) Create(ctx context.Context, inv *entity.Invoice) error {
	return database.DB.WithContext(ctx).Create(inv).Error
}

func (r *InvoiceRepositoryImpl) Update(ctx context.Context, inv *entity.Invoice) error {
	return database.DB.WithContext(ctx).Save(inv).Error
}
