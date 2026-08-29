// File: modules/billing/domain/service/invoice_service.go
package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	billingErrs "ruang-tukar/modules/billing/errs"
	"ruang-tukar/modules/billing/domain/entity"
	"ruang-tukar/modules/billing/domain/repository"
)

type InvoiceService struct {
	invoiceRepo repository.InvoiceRepository
}

func NewInvoiceService(repo repository.InvoiceRepository) *InvoiceService {
	return &InvoiceService{invoiceRepo: repo}
}

func (s *InvoiceService) GenerateInvoice(
	ctx context.Context,
	userID uint,
	subID *uint,
	orderID *uint,
	amount int64,
	itemName string,
) (*entity.Invoice, error) {
	now := time.Now()
	invoiceNumber := generateInvoiceNumber()

	items, _ := json.Marshal([]map[string]interface{}{
		{
			"description": itemName,
			"qty":         1,
			"amount":      amount,
		},
	})

	inv := &entity.Invoice{
		InvoiceNumber:  invoiceNumber,
		UserID:         userID,
		SubscriptionID: subID,
		OrderID:        orderID,
		Subtotal:       amount,
		Tax:            0,
		Total:          amount,
		Currency:       "IDR",
		Status:         "paid",
		DueDate:        now,
		PaidAt:         &now,
		SentAt:         &now,
		Items:          items,
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	if err := s.invoiceRepo.Create(ctx, inv); err != nil {
		return nil, err
	}

	return inv, nil
}

func (s *InvoiceService) GetUserInvoices(ctx context.Context, userID uint) ([]*entity.Invoice, error) {
	return s.invoiceRepo.FindByUserID(ctx, userID)
}

func (s *InvoiceService) GetInvoiceByID(ctx context.Context, id uint) (*entity.Invoice, error) {
	inv, err := s.invoiceRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ErrRecordNotFound {
			return nil, billingErrs.ErrInvoiceNotFound
		}
		return nil, err
	}
	return inv, nil
}

func (s *InvoiceService) GetAllInvoices(ctx context.Context) ([]*entity.Invoice, error) {
	return s.invoiceRepo.FindAll(ctx)
}

func generateInvoiceNumber() string {
	b := make([]byte, 2)
	_, _ = rand.Read(b)
	return fmt.Sprintf("INV-%s-%s", time.Now().Format("200601"), stringsToUpper(hex.EncodeToString(b)))
}

func stringsToUpper(s string) string {
	b := []byte(s)
	for i := range b {
		if b[i] >= 'a' && b[i] <= 'z' {
			b[i] -= 32
		}
	}
	return string(b)
}
