-- File: internal/database/migrations/20260829_000005_drop_max_per_user_from_plans.sql
-- Date Created: 2026-08-29
-- Module: Hosting
-- Description: Remove max_per_user limit — users can buy unlimited instances of any plan

ALTER TABLE hosting.plans DROP COLUMN IF EXISTS max_per_user;
