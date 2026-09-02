-- File: internal/database/migrations/20260901_000002_add_discount_to_orders.sql
-- Date Created: 2026-09-01
-- Module: Orders
-- Add voucher/discount tracking to orders

ALTER TABLE hosting.orders ADD COLUMN IF NOT EXISTS voucher_id BIGINT REFERENCES hosting.vouchers(id) ON DELETE SET NULL;
ALTER TABLE hosting.orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50);
ALTER TABLE hosting.orders ADD COLUMN IF NOT EXISTS discount_amount BIGINT NOT NULL DEFAULT 0;

ALTER TABLE hosting.order_items ADD COLUMN IF NOT EXISTS discount_amount BIGINT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_orders_voucher_id ON hosting.orders(voucher_id);
