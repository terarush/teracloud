-- File: internal/database/migrations/20260901_000004_add_discount_amount_to_order_items_down.sql
-- Date Created: 2026-09-01
-- Module: Orders

ALTER TABLE hosting.order_items DROP COLUMN IF EXISTS discount_amount;
