-- File: internal/database/migrations/20260829_000006_add_tunnel_routes_to_containers.sql
-- Date Created: 2026-08-29
-- Module: Containers
-- Description: Add tunnel_routes column to store Cloudflare subdomain mappings per container port

ALTER TABLE hosting.containers ADD COLUMN IF NOT EXISTS tunnel_routes JSONB DEFAULT '[]';

