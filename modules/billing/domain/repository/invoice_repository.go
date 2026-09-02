// File: modules/billing/domain/repository/invoice_repository.go
package repository

import (
	"context"
	"teracloud/modules/billing/domain/entity"
)

type InvoiceRepository interface {
	FindByID(ctx context.Context, id uint) (*entity.Invoice, error)
	FindByUserID(ctx context.Context, userID uint) ([]*entity.Invoice, error)
	FindAll(ctx context.Context) ([]*entity.Invoice, error)
	Create(ctx context.Context, inv *entity.Invoice) error
	Update(ctx context.Context, inv *entity.Invoice) error
}
