package entity

import (
	"time"

	"ruang-tukar/internal/pkg/database"
)

// PasswordResetToken represents a password reset token.
type PasswordResetToken struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	Email     string     `gorm:"index;not null" json:"email"`
	Token     string     `gorm:"uniqueIndex;not null" json:"-"`
	ExpiresAt time.Time  `json:"expires_at"`
	UsedAt    *time.Time `json:"used_at,omitempty"`
	CreatedAt time.Time  `json:"created_at"`
}

func (*PasswordResetToken) TableName() string {
	return database.T("password_reset_tokens")
}
