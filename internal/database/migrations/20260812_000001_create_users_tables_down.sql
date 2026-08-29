-- Migration: create_users_tables
-- Down: drop user sub-tables first (FK references users), then users

DROP TABLE IF EXISTS core.user_custom_sections;
DROP TABLE IF EXISTS core.user_badges;
DROP TABLE IF EXISTS core.user_social_medias;
DROP TABLE IF EXISTS core.user_profile_links;
DROP TABLE IF EXISTS core.users;