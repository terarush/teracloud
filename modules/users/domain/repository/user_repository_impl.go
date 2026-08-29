package repository

import (
	"context"
	"errors"
	"ruang-tukar/internal/pkg/database"
	"ruang-tukar/modules/users/domain/entity"
)

var (
	ERR_RECORD_NOT_FOUND = errors.New("record not found")
)

type UserRepositoryImpl struct{}

// Create implements UserRepository.
func (r UserRepositoryImpl) Create(ctx context.Context, user *entity.User) error {
	return database.DB.WithContext(ctx).Create(user).Error
}

// Delete implements UserRepository.
func (r UserRepositoryImpl) Delete(ctx context.Context, id uint) error {
	return database.DB.WithContext(ctx).Delete(&entity.User{}, id).Error
}

// FindAll finds all users
func (r UserRepositoryImpl) FindAll(ctx context.Context) ([]*entity.User, error) {
	var users []*entity.User
	result := database.DB.WithContext(ctx).Find(&users)
	if result.Error != nil {
		return nil, result.Error
	}
	return users, nil
}

// FindByEmail implements UserRepository.
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

// FindByID implements UserRepository.
func (r UserRepositoryImpl) FindByID(ctx context.Context, id uint) (*entity.User, error) {
	var user entity.User
	result := database.DB.WithContext(ctx).
		Preload("Links").
		Preload("Socials").
		Preload("Badges").
		Preload("Sections").
		First(&user, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

// Update implements UserRepository.
func (r UserRepositoryImpl) Update(ctx context.Context, user *entity.User) error {
	return database.DB.WithContext(ctx).Save(user).Error
}

// FindByUsername finds a user by username
func (r UserRepositoryImpl) FindByUsername(ctx context.Context, username string) (*entity.User, error) {
	var user entity.User
	result := database.DB.WithContext(ctx).
		Preload("Links").
		Preload("Socials").
		Preload("Badges").
		Preload("Sections").
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

// DeleteProfileLinksByUserID deletes all links for a given user.
func (r UserRepositoryImpl) DeleteProfileLinksByUserID(ctx context.Context, userID uint) error {
	return database.DB.WithContext(ctx).Where("user_id = ?", userID).Delete(&entity.UserProfileLink{}).Error
}

func NewUserRepositoryImpl() UserRepository {
	return UserRepositoryImpl{}
}
