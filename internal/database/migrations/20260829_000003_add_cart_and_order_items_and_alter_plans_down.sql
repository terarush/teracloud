-- File: internal/database/migrations/20260829_000003_add_cart_and_order_items_and_alter_plans_down.sql
-- Date Created: 2026-08-29
-- Module: Hosting

DROP TABLE IF EXISTS hosting.order_items CASCADE;
DROP TABLE IF EXISTS hosting.cart_items CASCADE;

ALTER TABLE hosting.plans DROP COLUMN IF EXISTS thumbnail_url;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS category;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS badge;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS is_featured;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS stock_limit;
ALTER TABLE hosting.plans DROP COLUMN IF EXISTS environment_template;
