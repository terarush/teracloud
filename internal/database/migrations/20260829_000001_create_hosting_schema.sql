-- File: internal/database/migrations/20260829_000001_create_hosting_schema.sql
-- Date Created: 2026-08-29
-- Module: Hosting
-- Creates all hosting schema tables for the Docker hosting platform

CREATE SCHEMA IF NOT EXISTS hosting;

-- Plans: Admin-managed Docker hosting products
CREATE TABLE IF NOT EXISTS hosting.plans (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    short_description VARCHAR(255),
    image_name VARCHAR(255) NOT NULL,
    image_tag VARCHAR(100) NOT NULL,
    cpu_limit DECIMAL(4,2) NOT NULL,
    memory_limit INT NOT NULL,
    disk_limit INT NOT NULL,
    bandwidth_limit INT,
    price_monthly BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    features JSONB DEFAULT '[]',
    icon VARCHAR(100),
    max_per_user INT DEFAULT 3,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Orders: Purchase/renewal transactions
CREATE TABLE IF NOT EXISTS hosting.orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES core.users(id),
    plan_id BIGINT NOT NULL REFERENCES hosting.plans(id),
    subscription_id BIGINT,
    order_type VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    midtrans_order_id VARCHAR(100) UNIQUE,
    midtrans_transaction_id VARCHAR(100),
    midtrans_payment_type VARCHAR(50),
    midtrans_va_number VARCHAR(100),
    snap_token TEXT,
    snap_redirect_url TEXT,
    paid_at TIMESTAMPTZ,
    expired_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON hosting.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON hosting.orders(status);

-- Subscriptions: Active user subscriptions
CREATE TABLE IF NOT EXISTS hosting.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id),
    plan_id BIGINT NOT NULL REFERENCES hosting.plans(id),
    container_id BIGINT,
    current_order_id BIGINT REFERENCES hosting.orders(id),
    status VARCHAR(20) NOT NULL DEFAULT 'provisioning',
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    grace_period_end TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    terminated_at TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    reminders_sent JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON hosting.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON hosting.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON hosting.subscriptions(period_end);

-- Add FK from orders to subscriptions (deferred because of circular dependency)
ALTER TABLE hosting.orders ADD CONSTRAINT fk_orders_subscription
    FOREIGN KEY (subscription_id) REFERENCES hosting.subscriptions(id);

-- Containers: Docker container instances
CREATE TABLE IF NOT EXISTS hosting.containers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES core.users(id),
    subscription_id BIGINT NOT NULL REFERENCES hosting.subscriptions(id),
    plan_id BIGINT NOT NULL REFERENCES hosting.plans(id),
    docker_container_id VARCHAR(100),
    container_name VARCHAR(100) NOT NULL UNIQUE,
    hostname VARCHAR(100),
    image_name VARCHAR(255) NOT NULL,
    image_tag VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'creating',
    cpu_limit DECIMAL(4,2) NOT NULL,
    memory_limit INT NOT NULL,
    disk_limit INT NOT NULL,
    volume_path TEXT,
    port_mappings JSONB,
    assigned_ports JSONB,
    internal_ip VARCHAR(45),
    last_started_at TIMESTAMPTZ,
    last_stopped_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_containers_user_id ON hosting.containers(user_id);
CREATE INDEX IF NOT EXISTS idx_containers_status ON hosting.containers(status);

-- Add FK from subscriptions to containers (deferred)
ALTER TABLE hosting.subscriptions ADD CONSTRAINT fk_subscriptions_container
    FOREIGN KEY (container_id) REFERENCES hosting.containers(id);

-- Container Events: Audit log for container actions
CREATE TABLE IF NOT EXISTS hosting.container_events (
    id BIGSERIAL PRIMARY KEY,
    container_id BIGINT NOT NULL REFERENCES hosting.containers(id),
    user_id BIGINT REFERENCES core.users(id),
    event_type VARCHAR(30) NOT NULL,
    description TEXT,
    metadata JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_container_events_container ON hosting.container_events(container_id);
CREATE INDEX IF NOT EXISTS idx_container_events_created ON hosting.container_events(created_at);

-- Invoices
CREATE TABLE IF NOT EXISTS hosting.invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES core.users(id),
    subscription_id BIGINT REFERENCES hosting.subscriptions(id),
    order_id BIGINT REFERENCES hosting.orders(id),
    subtotal BIGINT NOT NULL,
    tax BIGINT DEFAULT 0,
    total BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'IDR',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    items JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON hosting.invoices(user_id);

-- Billing Notifications
CREATE TABLE IF NOT EXISTS hosting.billing_notifications (
    id BIGSERIAL PRIMARY KEY,
    subscription_id BIGINT NOT NULL REFERENCES hosting.subscriptions(id),
    user_id BIGINT NOT NULL REFERENCES core.users(id),
    notification_type VARCHAR(30) NOT NULL,
    email_to VARCHAR(255) NOT NULL,
    email_subject VARCHAR(255) NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL,
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_billing_notif_subscription ON hosting.billing_notifications(subscription_id);

-- Container Stats
CREATE TABLE IF NOT EXISTS hosting.container_stats (
    id BIGSERIAL PRIMARY KEY,
    container_id BIGINT NOT NULL REFERENCES hosting.containers(id),
    cpu_usage_percent DECIMAL(5,2),
    memory_usage_mb INT,
    memory_limit_mb INT,
    network_rx_bytes BIGINT,
    network_tx_bytes BIGINT,
    disk_usage_bytes BIGINT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_container_stats_lookup ON hosting.container_stats(container_id, recorded_at);

-- Port Allocations
CREATE TABLE IF NOT EXISTS hosting.port_allocations (
    id BIGSERIAL PRIMARY KEY,
    container_id BIGINT NOT NULL REFERENCES hosting.containers(id),
    host_port INT NOT NULL UNIQUE,
    container_port INT NOT NULL,
    protocol VARCHAR(5) DEFAULT 'tcp',
    description VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_port_alloc_container ON hosting.port_allocations(container_id);
