-- File: internal/database/migrations/20260829_000004_add_port_configurations_to_plans.sql
-- Date Created: 2026-08-29
-- Module: Hosting

-- Add port configuration, default command, and environment definitions to hosting.plans
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS port_config JSONB DEFAULT '[]';
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS command TEXT;
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS entrypoint TEXT;

-- Update existing plans with a default port config if empty
UPDATE hosting.plans 
SET port_config = '[{"container_port": 80, "protocol": "tcp", "name": "HTTP", "description": "Web Application Port", "is_primary": true}]'::jsonb
WHERE port_config IS NULL OR port_config = '[]'::jsonb;
