-- File: internal/database/migrations/20260829_000001_create_hosting_schema_down.sql
ALTER TABLE hosting.subscriptions DROP CONSTRAINT IF EXISTS fk_subscriptions_container;
ALTER TABLE hosting.orders DROP CONSTRAINT IF EXISTS fk_orders_subscription;

DROP TABLE IF EXISTS hosting.port_allocations;
DROP TABLE IF EXISTS hosting.container_stats;
DROP TABLE IF EXISTS hosting.billing_notifications;
DROP TABLE IF EXISTS hosting.invoices;
DROP TABLE IF EXISTS hosting.container_events;
DROP TABLE IF EXISTS hosting.containers;
DROP TABLE IF EXISTS hosting.subscriptions;
DROP TABLE IF EXISTS hosting.orders;
DROP TABLE IF EXISTS hosting.plans;
DROP SCHEMA IF EXISTS hosting;
