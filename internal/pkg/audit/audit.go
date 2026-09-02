// File: internal/pkg/audit/audit.go
package audit

import (
	"context"
	"encoding/json"
	"time"

	"teracloud/internal/pkg/database"
)

// AuditLog represents a single audit log entry in core.audit_logs.
type AuditLog struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	UserID        *uint           `gorm:"column:user_id" json:"user_id"`
	ActorType     string          `gorm:"column:actor_type;type:varchar(20)" json:"actor_type"`
	SchemaName    string          `gorm:"column:schema_name;type:varchar(50)" json:"schema_name"`
	Table         string          `gorm:"column:table_name;type:varchar(100)" json:"table_name"`
	RecordID      uint            `gorm:"column:record_id" json:"record_id"`
	Action        string          `gorm:"column:action;type:varchar(20)" json:"action"`
	Summary       string          `gorm:"column:summary;type:varchar(255)" json:"summary"`
	OldValues     json.RawMessage `gorm:"column:old_values;type:jsonb" json:"old_values"`
	NewValues     json.RawMessage `gorm:"column:new_values;type:jsonb" json:"new_values"`
	ChangedFields json.RawMessage `gorm:"column:changed_fields;type:jsonb" json:"changed_fields"`
	IPAddress     string          `gorm:"column:ip_address;type:varchar(45)" json:"ip_address"`
	UserAgent     string          `gorm:"column:user_agent;type:text" json:"user_agent"`
	RequestID     string          `gorm:"column:request_id;type:varchar(100)" json:"request_id"`
	Module        string          `gorm:"column:module;type:varchar(50)" json:"module"`
	Severity      string          `gorm:"column:severity;type:varchar(10);default:info" json:"severity"`
	CreatedAt     time.Time       `gorm:"column:created_at" json:"created_at"`
}

func (AuditLog) TableName() string {
	return database.T("audit_logs")
}

// Params holds parameters for creating an audit entry.
type Params struct {
	UserID        *uint
	ActorType     string // "user", "admin", "system", "midtrans_webhook"
	SchemaName    string // "core", "hosting"
	TableName     string // "containers", "orders", etc.
	RecordID      uint
	Action        string // "create", "update", "delete", "container_start", etc.
	Summary       string
	OldValues     interface{}
	NewValues     interface{}
	ChangedFields []string
	IPAddress     string
	UserAgent     string
	RequestID     string
	Module        string // "plans", "orders", "containers", "billing"
	Severity      string // "info", "warning", "critical"
}

// Log creates an audit log entry in the database.
func Log(ctx context.Context, p Params) error {
	if p.Severity == "" {
		p.Severity = "info"
	}
	if p.ActorType == "" {
		p.ActorType = "system"
	}

	entry := AuditLog{
		UserID:     p.UserID,
		ActorType:  p.ActorType,
		SchemaName: p.SchemaName,
		Table:      p.TableName,
		RecordID:   p.RecordID,
		Action:     p.Action,
		Summary:    p.Summary,
		IPAddress:  p.IPAddress,
		UserAgent:  p.UserAgent,
		RequestID:  p.RequestID,
		Module:     p.Module,
		Severity:   p.Severity,
		CreatedAt:  time.Now(),
	}

	if p.OldValues != nil {
		if data, err := json.Marshal(p.OldValues); err == nil {
			entry.OldValues = data
		}
	}
	if p.NewValues != nil {
		if data, err := json.Marshal(p.NewValues); err == nil {
			entry.NewValues = data
		}
	}
	if len(p.ChangedFields) > 0 {
		if data, err := json.Marshal(p.ChangedFields); err == nil {
			entry.ChangedFields = data
		}
	}

	return database.DB.WithContext(ctx).Create(&entry).Error
}

// LogAsync fires an audit log in a goroutine (fire-and-forget).
func LogAsync(p Params) {
	go func() {
		_ = Log(context.Background(), p)
	}()
}
