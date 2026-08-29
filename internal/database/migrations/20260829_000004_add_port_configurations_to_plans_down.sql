-- File: internal/database/migrations/20260829_000004_add_port_configurations_to_plans_down.sql
-- Date Created: 2026-08-29
-- Module: Hosting

ALTER TABLE hosting.plans DROP COLUMN IF EXISTS port_config;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS command;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS entrypoint;
