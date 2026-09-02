// File: modules/vouchers/domain/service/voucher_service_test.go
package service

import (
	"context"
	"testing"
	"time"

	"teracloud/internal/pkg/utils"
	"teracloud/modules/vouchers/domain/entity"
	"teracloud/modules/vouchers/domain/repository"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type mockVoucherRepo struct {
	byCode     map[string]*entity.Voucher
	byID       map[uint]*entity.Voucher
	planIDs    map[uint][]uint
	totalUsage map[uint]int64
	userUsage  map[uint]int64 // key: voucherID
	createErr  error
	updateErr  error
	deleteErr  error
	recorded   []*entity.VoucherUsage
}

func (m *mockVoucherRepo) Create(_ context.Context, v *entity.Voucher, _ []uint) error {
	if m.createErr != nil {
		return m.createErr
	}
	return nil
}

func (m *mockVoucherRepo) Update(_ context.Context, v *entity.Voucher, _ []uint) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	return nil
}

func (m *mockVoucherRepo) Delete(_ context.Context, _ uint) error {
	if m.deleteErr != nil {
		return m.deleteErr
	}
	return nil
}

func (m *mockVoucherRepo) FindByID(_ context.Context, id uint) (*entity.Voucher, error) {
	if v, ok := m.byID[id]; ok {
		return v, nil
	}
	return nil, repository.ErrRecordNotFound
}

func (m *mockVoucherRepo) FindByCode(_ context.Context, code string) (*entity.Voucher, error) {
	if v, ok := m.byCode[code]; ok {
		return v, nil
	}
	return nil, repository.ErrRecordNotFound
}

func (m *mockVoucherRepo) FindAll(_ context.Context) ([]*entity.Voucher, error) {
	out := make([]*entity.Voucher, 0, len(m.byID))
	for _, v := range m.byID {
		out = append(out, v)
	}
	return out, nil
}

func (m *mockVoucherRepo) GetPlanIDs(_ context.Context, voucherID uint) ([]uint, error) {
	return m.planIDs[voucherID], nil
}

func (m *mockVoucherRepo) CountTotalUsage(_ context.Context, voucherID uint) (int64, error) {
	return m.totalUsage[voucherID], nil
}

func (m *mockVoucherRepo) CountUserUsage(_ context.Context, voucherID, _ uint) (int64, error) {
	return m.userUsage[voucherID], nil
}

func (m *mockVoucherRepo) CreateUsage(_ context.Context, u *entity.VoucherUsage) error {
	m.recorded = append(m.recorded, u)
	return nil
}

func newActiveVoucher(discountType string, value int64) *entity.Voucher {
	now := time.Now()
	start := now.Add(-time.Hour)
	end := now.Add(24 * time.Hour)
	return &entity.Voucher{
		ID:            1,
		Code:          "TEST10",
		DiscountType:  discountType,
		DiscountValue: value,
		AppliesTo:     entity.AppliesToAll,
		StartAt:       &start,
		EndAt:         &end,
		IsActive:      true,
	}
}

func TestComputeDiscountPercentage(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypePercentage, 10)
	// 1_000_000 * 10% = 100_000
	assert.Equal(t, int64(100_000), computeDiscount(v, 1_000_000))
	// 10% of 50_000 = 5_000 (no capping since it's under subtotal)
	assert.Equal(t, int64(5_000), computeDiscount(v, 50_000))
	// no discount on non-positive subtotal
	assert.Equal(t, int64(0), computeDiscount(v, 0))
}

func TestComputeDiscountPercentageWithCap(t *testing.T) {
	cap := int64(50_000)
	v := newActiveVoucher(entity.DiscountTypePercentage, 20)
	v.MaxDiscountAmount = &cap
	// 1_000_000 * 20% = 200_000, capped at 50_000
	assert.Equal(t, int64(50_000), computeDiscount(v, 1_000_000))
	// 200_000 * 20% = 40_000, under cap
	assert.Equal(t, int64(40_000), computeDiscount(v, 200_000))
}

func TestComputeDiscountFixed(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypeFixed, 50_000)
	assert.Equal(t, int64(50_000), computeDiscount(v, 500_000))
	// cannot discount below zero
	assert.Equal(t, int64(30_000), computeDiscount(v, 30_000))
}

// per-plan stacking: 10% off each eligible plan item
func TestApplyVoucherStacksPerPlan(t *testing.T) {
	repo := &mockVoucherRepo{
		byCode: map[string]*entity.Voucher{"TEST10": newActiveVoucher(entity.DiscountTypePercentage, 10)},
	}
	svc := NewVoucherService(repo, nil)
	ctx := context.Background()

	items := []DiscountItem{
		{PlanID: 1, Subtotal: 1_000_000},
		{PlanID: 2, Subtotal: 500_000},
	}
	res, err := svc.ApplyVoucher(ctx, "TEST10", 1, items)
	require.NoError(t, err)
	assert.Equal(t, int64(100_000), res.DiscountPerItem[0]) // 10% of 1M
	assert.Equal(t, int64(50_000), res.DiscountPerItem[1])  // 10% of 500k
	assert.Equal(t, int64(150_000), res.TotalDiscount)
	assert.Equal(t, int64(1_350_000), res.TotalAfter) // 1.5M - 150k
}

// no voucher code => zero discount, no error
func TestApplyVoucherEmptyCode(t *testing.T) {
	repo := &mockVoucherRepo{}
	svc := NewVoucherService(repo, nil)
	res, err := svc.ApplyVoucher(context.Background(), "", 1, []DiscountItem{{PlanID: 1, Subtotal: 100_000}})
	require.NoError(t, err)
	assert.Equal(t, int64(0), res.TotalDiscount)
	assert.Nil(t, res.Voucher)
}

// voucher restricted to specific plans only discounts matching items
func TestApplyVoucherSpecificPlans(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypePercentage, 10)
	v.AppliesTo = entity.AppliesToSpecificPlans
	repo := &mockVoucherRepo{
		byCode:  map[string]*entity.Voucher{"PONLY": v},
		planIDs: map[uint][]uint{1: {1, 3}}, // only plan 1 and 3 eligible
	}
	svc := NewVoucherService(repo, nil)
	items := []DiscountItem{
		{PlanID: 1, Subtotal: 1_000_000}, // eligible -> 100k
		{PlanID: 2, Subtotal: 500_000},   // not eligible -> 0
	}
	res, err := svc.ApplyVoucher(context.Background(), "PONLY", 1, items)
	require.NoError(t, err)
	assert.Equal(t, int64(100_000), res.DiscountPerItem[0])
	assert.Equal(t, int64(0), res.DiscountPerItem[1])
	assert.Equal(t, int64(100_000), res.TotalDiscount)
}

func TestApplyVoucherUsageLimit(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypePercentage, 10)
	limit := 1
	v.TotalUsageLimit = &limit
	repo := &mockVoucherRepo{
		byCode:     map[string]*entity.Voucher{"LIMIT1": v},
		totalUsage: map[uint]int64{1: 1}, // already used once
	}
	svc := NewVoucherService(repo, nil)
	_, err := svc.ApplyVoucher(context.Background(), "LIMIT1", 1, []DiscountItem{{PlanID: 1, Subtotal: 100_000}})
	require.Error(t, err)
	assert.Equal(t, "VOUCHER_USAGE_LIMIT", utils.CodeOf(err))
}

func TestApplyVoucherPerUserLimit(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypePercentage, 10)
	limit := 2
	v.PerUserUsageLimit = &limit
	repo := &mockVoucherRepo{
		byCode:    map[string]*entity.Voucher{"USER2": v},
		userUsage: map[uint]int64{1: 2}, // user already used it twice
	}
	svc := NewVoucherService(repo, nil)
	_, err := svc.ApplyVoucher(context.Background(), "USER2", 7, []DiscountItem{{PlanID: 1, Subtotal: 100_000}})
	require.Error(t, err)
	assert.Equal(t, "VOUCHER_USAGE_LIMIT", utils.CodeOf(err))
}

func TestApplyVoucherMinAmount(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypePercentage, 10)
	v.MinOrderAmount = 1_000_000
	repo := &mockVoucherRepo{
		byCode: map[string]*entity.Voucher{"MIN1": v},
	}
	svc := NewVoucherService(repo, nil)
	// order subtotal 600k < 1M minimum
	_, err := svc.ApplyVoucher(context.Background(), "MIN1", 1, []DiscountItem{{PlanID: 1, Subtotal: 600_000}})
	require.Error(t, err)
	assert.Equal(t, "VOUCHER_MIN_AMOUNT", utils.CodeOf(err))
}

func TestApplyVoucherExpired(t *testing.T) {
	v := newActiveVoucher(entity.DiscountTypePercentage, 10)
	expired := time.Now().Add(-time.Hour)
	v.EndAt = &expired
	repo := &mockVoucherRepo{
		byCode: map[string]*entity.Voucher{"OLD": v},
	}
	svc := NewVoucherService(repo, nil)
	_, err := svc.ApplyVoucher(context.Background(), "OLD", 1, []DiscountItem{{PlanID: 1, Subtotal: 100_000}})
	require.Error(t, err)
	assert.Equal(t, "VOUCHER_EXPIRED", utils.CodeOf(err))
}

func TestRecordUsage(t *testing.T) {
	repo := &mockVoucherRepo{}
	svc := NewVoucherService(repo, nil)
	id := uint(9)
	err := svc.RecordUsage(context.Background(), 1, 7, id, 50_000)
	require.NoError(t, err)
	require.Len(t, repo.recorded, 1)
	assert.Equal(t, id, *repo.recorded[0].OrderID)
	assert.Equal(t, int64(50_000), repo.recorded[0].DiscountAmount)
}
