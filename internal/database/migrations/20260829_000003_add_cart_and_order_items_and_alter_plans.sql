-- File: internal/database/migrations/20260829_000003_add_cart_and_order_items_and_alter_plans.sql
-- Date Created: 2026-08-29
-- Module: Hosting

-- 1. Alter hosting.plans to add metadata columns
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'os';
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS badge VARCHAR(50);
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS stock_limit INT;
ALTER TABLE hosting.plans ADD COLUMN IF NOT EXISTS environment_template JSONB DEFAULT '{}';

-- 2. Create hosting.cart_items
CREATE TABLE IF NOT EXISTS hosting.cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES hosting.plans(id) ON DELETE CASCADE,
    custom_name VARCHAR(100),
    duration_months INT NOT NULL DEFAULT 1,
    environment_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_user_plan_name UNIQUE (user_id, plan_id, custom_name)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON hosting.cart_items(user_id);

-- 3. Adjust hosting.orders
ALTER TABLE hosting.orders ADD COLUMN IF NOT EXISTS total_amount BIGINT;
-- backfill total_amount if amount existed
UPDATE hosting.orders SET total_amount = amount WHERE total_amount IS NULL AND amount IS NOT NULL;
ALTER TABLE hosting.orders ALTER COLUMN plan_id DROP NOT NULL;

-- 4. Create hosting.order_items
CREATE TABLE IF NOT EXISTS hosting.order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES hosting.orders(id) ON DELETE CASCADE,
    plan_id BIGINT NOT NULL REFERENCES hosting.plans(id),
    subscription_id BIGINT REFERENCES hosting.subscriptions(id),
    custom_name VARCHAR(100),
    duration_months INT NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL,
    environment_config JSONB DEFAULT '{}',
    provisioning_status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON hosting.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_plan_id ON hosting.order_items(plan_id);
