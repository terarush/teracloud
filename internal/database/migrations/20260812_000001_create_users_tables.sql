-- Date Created: 2026-08-12
-- Module: Users
-- Regenerated for Teracloud core users

CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(50),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    avatar TEXT,
    auth_provider VARCHAR(20) DEFAULT 'local',
    google_id VARCHAR(100),
    password VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON core.users(username) WHERE username IS NOT NULL AND username != '';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON core.users(email) WHERE email IS NOT NULL AND email != '';
CREATE INDEX IF NOT EXISTS idx_users_google_id ON core.users(google_id) WHERE google_id IS NOT NULL AND google_id != '';
