-- Migration: create_password_reset_tokens_table
-- Down: drop password_reset_tokens table

DROP TABLE IF EXISTS core.password_reset_tokens;