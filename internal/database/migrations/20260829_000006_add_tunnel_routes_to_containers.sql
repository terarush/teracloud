-- Add tunnel_routes column to store Cloudflare subdomain mappings per container port
ALTER TABLE hosting.containers ADD COLUMN IF NOT EXISTS tunnel_routes JSONB DEFAULT '[]';
