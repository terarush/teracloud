-- File: internal/database/migrations/20260901_000004_add_discount_amount_to_order_items.sql
-- Date Created: 2026-09-01
-- Module: Orders
-- Corrective migration: order_items.discount_amount was lost in some databases
-- (recorded as applied by 20260901_000002 but column missing from live table).
-- Idempotent — safe to run whether or not the column already exists.

ALTER TABLE hosting.order_items ADD COLUMN IF NOT EXISTS discount_amount BIGINT NOT NULL DEFAULT 0;
