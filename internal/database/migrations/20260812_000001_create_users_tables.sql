-- Date Created: 2026-08-12
-- Module: Users
-- Regenerated from modules/users/domain/entity/user.go

CREATE SCHEMA IF NOT EXISTS core;
-- NOTE: `core.` prefix applies to PostgreSQL; MySQL (DB_DRIVER=mysql) uses
-- unqualified names via internal/pkg/database.SchemaPrefix / T().

CREATE TABLE IF NOT EXISTS core.users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    username VARCHAR(50),
    email VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    avatar TEXT,
    banner TEXT,
    bio TEXT,
    location VARCHAR(100),
    website VARCHAR(255),
    verified_at TIMESTAMPTZ,
    auth_provider VARCHAR(20) DEFAULT 'local',
    google_id VARCHAR(100),
    password VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON core.users(google_id) WHERE google_id IS NOT NULL AND google_id != '';

CREATE TABLE IF NOT EXISTS core.user_profile_links (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profile_links_user_id ON core.user_profile_links(user_id);

CREATE TABLE IF NOT EXISTS core.user_social_medias (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    handle VARCHAR(100) NOT NULL,
    url VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_social_medias_user_id ON core.user_social_medias(user_id);

CREATE TABLE IF NOT EXISTS core.user_badges (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    description VARCHAR(255),
    color VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON core.user_badges(user_id);

CREATE TABLE IF NOT EXISTS core.user_custom_sections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_custom_sections_user_id ON core.user_custom_sections(user_id);