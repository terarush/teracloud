package repository

import (
	"context"
	"time"
	"ruang-tukar/internal/pkg/database"
	authEntity "ruang-tukar/modules/auth/domain/entity"
)

// PasswordResetTokenRepositoryImpl implements PasswordResetTokenRepository.
type PasswordResetTokenRepositoryImpl struct{}

func NewPasswordResetTokenRepository() PasswordResetTokenRepository {
	return &PasswordResetTokenRepositoryImpl{}
}

func (r *PasswordResetTokenRepositoryImpl) Create(ctx context.Context, t *authEntity.PasswordResetToken) error {
	return database.DB.WithContext(ctx).Create(t).Error
}

func (r *PasswordResetTokenRepositoryImpl) FindByToken(ctx context.Context, token string) (*authEntity.PasswordResetToken, error) {
	var t authEntity.PasswordResetToken
	err := database.DB.WithContext(ctx).
		Where("token = ? AND expires_at > ? AND used_at IS NULL", token, time.Now()).
		First(&t).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *PasswordResetTokenRepositoryImpl) MarkUsed(ctx context.Context, id uint) error {
	now := time.Now()
	return database.DB.WithContext(ctx).
		Model(&authEntity.PasswordResetToken{}).
		Where("id = ?", id).
		Update("used_at", &now).Error
}
