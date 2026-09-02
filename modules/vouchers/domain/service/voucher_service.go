// File: modules/vouchers/domain/service/voucher_service.go
package service

import (
	"context"
	"strings"
	"time"

	"teracloud/internal/pkg/bus"
	"teracloud/modules/vouchers/domain/entity"
	"teracloud/modules/vouchers/domain/repository"
	voucherErrs "teracloud/modules/vouchers/errs"
)

// DiscountItem describes a single line item the voucher is applied against.
type DiscountItem struct {
	PlanID     uint
	UnitPrice  int64
	Duration   int
	Subtotal   int64
	Discounted bool // whether this item was eligible and got a discount
	Discount   int64
}

// VoucherResult is the outcome of validating and applying a voucher.
type VoucherResult struct {
	Voucher         *entity.Voucher
	DiscountPerItem []int64 // parallel to input items; 0 = no discount
	TotalDiscount   int64
	TotalAfter      int64
}

type VoucherService struct {
	repo  repository.VoucherRepository
	event *bus.EventBus
}

func NewVoucherService(repo repository.VoucherRepository, event *bus.EventBus) *VoucherService {
	return &VoucherService{repo: repo, event: event}
}

// ---- Admin CRUD ----

func (s *VoucherService) CreateVoucher(ctx context.Context, v *entity.Voucher, planIDs []uint) error {
	v.Code = strings.ToUpper(strings.TrimSpace(v.Code))
	if v.AppliesTo == "" {
		v.AppliesTo = entity.AppliesToAll
	}
	if _, err := s.repo.FindByCode(ctx, v.Code); err == nil {
		return voucherErrs.ErrVoucherCodeExists
	}
	return s.repo.Create(ctx, v, planIDs)
}

func (s *VoucherService) UpdateVoucher(ctx context.Context, v *entity.Voucher, planIDs []uint) error {
	return s.repo.Update(ctx, v, planIDs)
}

func (s *VoucherService) DeleteVoucher(ctx context.Context, id uint) error {
	return s.repo.Delete(ctx, id)
}

func (s *VoucherService) ToggleVoucher(ctx context.Context, id uint) (*entity.Voucher, error) {
	v, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, voucherErrs.ErrVoucherNotFound
	}
	v.IsActive = !v.IsActive
	v.UpdatedAt = time.Now()
	if err := s.repo.Update(ctx, v, nil); err != nil {
		return nil, err
	}
	return v, nil
}

func (s *VoucherService) ListVouchers(ctx context.Context) ([]*entity.Voucher, error) {
	return s.repo.FindAll(ctx)
}

func (s *VoucherService) GetVoucherByID(ctx context.Context, id uint) (*entity.Voucher, error) {
	v, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, voucherErrs.ErrVoucherNotFound
	}
	return v, nil
}

// ---- Discount application (used by orders) ----

// ApplyVoucher validates a voucher for a user + order items and computes the discount.
// It returns the voucher along with per-item discounts. It does NOT record usage — that
// happens on order payment.
func (s *VoucherService) ApplyVoucher(ctx context.Context, code string, userID uint, items []DiscountItem) (*VoucherResult, error) {
	if strings.TrimSpace(code) == "" {
		return &VoucherResult{DiscountPerItem: make([]int64, len(items))}, nil
	}

	v, err := s.repo.FindByCode(ctx, strings.TrimSpace(code))
	if err != nil {
		return nil, voucherErrs.ErrVoucherNotFound
	}

	if err := s.validate(ctx, v, userID, items); err != nil {
		return nil, err
	}

	// Determine eligible plan IDs for specific vouchers
	var eligiblePlans map[uint]bool
	if v.AppliesTo == entity.AppliesToSpecificPlans {
		planIDs, err := s.repo.GetPlanIDs(ctx, v.ID)
		if err != nil {
			return nil, err
		}
		eligiblePlans = make(map[uint]bool, len(planIDs))
		for _, pid := range planIDs {
			eligiblePlans[pid] = true
		}
	}

	discounts := make([]int64, len(items))
	var totalDiscount int64
	for i := range items {
		it := &items[i]
		if v.AppliesTo == entity.AppliesToSpecificPlans && !eligiblePlans[it.PlanID] {
			discounts[i] = 0
			continue
		}
		d := computeDiscount(v, it.Subtotal)
		discounts[i] = d
		it.Discounted = d > 0
		it.Discount = d
		totalDiscount += d
	}

	totalBefore := int64(0)
	for _, it := range items {
		totalBefore += it.Subtotal
	}
	totalAfter := totalBefore - totalDiscount
	if totalAfter < 0 {
		totalAfter = 0
	}

	return &VoucherResult{
		Voucher:         v,
		DiscountPerItem: discounts,
		TotalDiscount:   totalDiscount,
		TotalAfter:      totalAfter,
	}, nil
}

// RecordUsage records a voucher redemption against an order (called once order is paid).
func (s *VoucherService) RecordUsage(ctx context.Context, voucherID, userID uint, orderID uint, discountAmount int64) error {
	return s.repo.CreateUsage(ctx, &entity.VoucherUsage{
		VoucherID:      voucherID,
		UserID:         userID,
		OrderID:        &orderID,
		DiscountAmount: discountAmount,
	})
}

func (s *VoucherService) validate(ctx context.Context, v *entity.Voucher, userID uint, items []DiscountItem) error {
	if !v.IsActive {
		return voucherErrs.ErrVoucherInvalid
	}

	now := time.Now()
	if v.StartAt != nil && now.Before(*v.StartAt) {
		return voucherErrs.ErrVoucherExpired
	}
	if v.EndAt != nil && now.After(*v.EndAt) {
		return voucherErrs.ErrVoucherExpired
	}

	// Total usage limit
	if v.TotalUsageLimit != nil {
		count, err := s.repo.CountTotalUsage(ctx, v.ID)
		if err != nil {
			return err
		}
		if count >= int64(*v.TotalUsageLimit) {
			return voucherErrs.ErrVoucherUsageLimit
		}
	}

	// Per-user usage limit
	if v.PerUserUsageLimit != nil {
		count, err := s.repo.CountUserUsage(ctx, v.ID, userID)
		if err != nil {
			return err
		}
		if count >= int64(*v.PerUserUsageLimit) {
			return voucherErrs.ErrVoucherUsageLimit
		}
	}

	// Minimum order amount
	var orderSubtotal int64
	for _, it := range items {
		orderSubtotal += it.Subtotal
	}
	if v.MinOrderAmount > 0 && orderSubtotal < v.MinOrderAmount {
		return voucherErrs.ErrVoucherMinAmount
	}

	return nil
}

// computeDiscount returns the discount for a single eligible item's subtotal.
func computeDiscount(v *entity.Voucher, subtotal int64) int64 {
	if subtotal <= 0 {
		return 0
	}
	var discount int64
	if v.DiscountType == entity.DiscountTypePercentage {
		discount = subtotal * v.DiscountValue / 100
		if v.MaxDiscountAmount != nil && discount > *v.MaxDiscountAmount {
			discount = *v.MaxDiscountAmount
		}
	} else { // fixed_amount
		discount = v.DiscountValue
	}
	if discount > subtotal {
		discount = subtotal
	}
	if discount < 0 {
		return 0
	}
	return discount
}
