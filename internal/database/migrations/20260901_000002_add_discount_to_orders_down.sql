-- File: internal/database/migrations/20260901_000002_add_discount_to_orders_down.sql
-- Date Created: 2026-09-01
-- Module: Orders

ALTER TABLE hosting.orders DROP COLUMN IF EXISTS voucher_id;
ALTER TABLE hosting.orders DROP COLUMN IF EXISTS voucher_code;
ALTER TABLE hosting.orders DROP COLUMN IF EXISTS discount_amount;

ALTER TABLE hosting.order_items DROP COLUMN IF EXISTS discount_amount;
