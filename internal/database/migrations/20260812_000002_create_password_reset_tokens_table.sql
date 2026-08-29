-- Date Created: 2026-08-12
-- Module: Auth
-- Regenerated from modules/auth/domain/entity/password_reset_token.go

CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE IF NOT EXISTS core.password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON core.password_reset_tokens(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON core.password_reset_tokens(token);