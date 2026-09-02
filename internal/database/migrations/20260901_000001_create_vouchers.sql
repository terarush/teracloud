-- File: internal/database/migrations/20260901_000001_create_vouchers.sql
-- Date Created: 2026-09-01
-- Module: Vouchers
-- Voucher discount system: vouchers, voucher_plans pivot, voucher_usages

-- 1. hosting.vouchers
CREATE TABLE IF NOT EXISTS hosting.vouchers (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100),
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,          -- 'percentage' | 'fixed_amount'
    discount_value BIGINT NOT NULL,              -- percent (0-100) or fixed amount (IDR)
    min_order_amount BIGINT DEFAULT 0,           -- minimum order subtotal to be eligible
    max_discount_amount BIGINT,                  -- optional cap on percentage discount (IDR); NULL = no cap
    applies_to VARCHAR(20) NOT NULL DEFAULT 'all', -- 'all' | 'specific_plans'
    total_usage_limit INT,                       -- NULL = unlimited total usage
    per_user_usage_limit INT,                    -- NULL = unlimited per user
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON hosting.vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON hosting.vouchers(is_active);

-- 2. hosting.voucher_plans (pivot: which plans a specific_plans voucher applies to)
CREATE TABLE IF NOT EXISTS hosting.voucher_plans (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT NOT NULL REFERENCES hosting.vouchers(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES hosting.plans(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_voucher_plan UNIQUE (voucher_id, plan_id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_plans_voucher ON hosting.voucher_plans(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_plans_plan ON hosting.voucher_plans(plan_id);

-- 3. hosting.voucher_usages (track redemption per user per order)
CREATE TABLE IF NOT EXISTS hosting.voucher_usages (
    id BIGSERIAL PRIMARY KEY,
    voucher_id BIGINT NOT NULL REFERENCES hosting.vouchers(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    order_id BIGINT REFERENCES hosting.orders(id) ON DELETE SET NULL,
    discount_amount BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_voucher_usage_order UNIQUE (voucher_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_voucher_usages_voucher ON hosting.voucher_usages(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_user ON hosting.voucher_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usages_order ON hosting.voucher_usages(order_id);
