package repository

import (
	"context"
	authEntity "ruang-tukar/modules/auth/domain/entity"
)

// PasswordResetTokenRepository handles password reset token persistence.
type PasswordResetTokenRepository interface {
	Create(ctx context.Context, t *authEntity.PasswordResetToken) error
	FindByToken(ctx context.Context, token string) (*authEntity.PasswordResetToken, error)
	MarkUsed(ctx context.Context, id uint) error
}
