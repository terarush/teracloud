-- File: internal/database/migrations/20260829_000002_create_audit_logs.sql
-- Date Created: 2026-08-29
-- Module: Core
-- Centralized audit trail for all schemas

CREATE TABLE IF NOT EXISTS core.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES core.users(id),
    actor_type VARCHAR(20) NOT NULL,
    schema_name VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(20) NOT NULL,
    summary VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    changed_fields JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_id VARCHAR(100),
    module VARCHAR(50),
    severity VARCHAR(10) DEFAULT 'info',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_id ON core.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON core.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_table ON core.audit_logs(schema_name, table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON core.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON core.audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_severity ON core.audit_logs(severity) WHERE severity != 'info';
CREATE INDEX IF NOT EXISTS idx_audit_request ON core.audit_logs(request_id) WHERE request_id IS NOT NULL;
