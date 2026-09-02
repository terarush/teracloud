-- File: internal/database/migrations/20260901_000001_create_vouchers_down.sql
-- Date Created: 2026-09-01
-- Module: Vouchers

DROP TABLE IF EXISTS hosting.voucher_usages CASCADE;
DROP TABLE IF EXISTS hosting.voucher_plans CASCADE;
DROP TABLE IF EXISTS hosting.vouchers CASCADE;
