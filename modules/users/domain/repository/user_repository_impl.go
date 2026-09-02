package repository

import (
	"context"
	"errors"
	"teracloud/internal/pkg/database"
	"teracloud/modules/users/domain/entity"
)

var (
	ERR_RECORD_NOT_FOUND = errors.New("record not found")
)

// UserRepositoryImpl implements UserRepository interface
type UserRepositoryImpl struct{}

// FindAll finds all users
func (r UserRepositoryImpl) FindAll(ctx context.Context) ([]*entity.User, error) {
	var users []*entity.User
	result := database.DB.WithContext(ctx).Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

// FindByID finds a user by ID
func (r UserRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.User, error) {
	var user entity.User
	result := database.DB.WithContext(ctx).First(&user, id)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ERR_RECORD_NOT_FOUND
		}
		return nil, result.Error
	}
	return &user, nil
}

// Create creates a new user
func (r UserRepositoryImpl) Create(ctx context.Context, user *entity.User) error {
	result := database.DB.WithContext(ctx).Create(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// Update updates a user
func (r UserRepositoryImpl) Update(ctx context.Context, user *entity.User) error {
	result := database.DB.WithContext(ctx).Save(user)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// Delete deletes a user
func (r UserRepositoryImpl) Delete(ctx context.Context, id uint) error {
	result := database.DB.WithContext(ctx).Delete(&entity.User{}, id)
	if result.Error != nil {
		return result.Error
	}
	return nil
}

// FindByEmail finds a user by email
func (r UserRepositoryImpl) FindByEmail(ctx context.Context, email string) (*entity.User, error) {
	var user entity.User
	result := database.DB.WithContext(ctx).Where("email = ?", email).First(&user)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ERR_RECORD_NOT_FOUND
		}
		return nil, result.Error
	}
	return &user, nil
}

// FindByUsername finds a user by username
func (r UserRepositoryImpl) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	var user entity.User
	result := database.DB.WithContext(ctx).
		Where("username = ?", username).
		First(&user)
	if result.Error != nil {
		if result.RowsAffected == 0 {
			return nil, ERR_RECORD_NOT_FOUND
		}
		return nil, result.Error
	}
	return &user, nil
}

// UpdatePasswordByEmail updates hashed password by email.
func (r UserRepositoryImpl) UpdatePasswordByEmail(ctx context.Context, email, hashedPassword string) error {
	return database.DB.WithContext(ctx).
		Model(&entity.User{}).
		Where("email = ?", email).
		Update("password", hashedPassword).Error
}

func NewUserRepositoryImpl() UserRepository {
	return UserRepositoryImpl{}
}
