package service

import (
	"context"
	"errors"
	"testing"
	"time"

	authEntity "teracloud/modules/auth/domain/entity"
	authRepo "teracloud/modules/auth/domain/repository"
	"teracloud/internal/pkg/utils"
	"teracloud/modules/users/domain/entity"
	"teracloud/modules/users/domain/repository"
	"teracloud/modules/users/dto/request"
)

type mockAuthUserRepo struct {
	users       map[uint]*entity.User
	findByIDErr error
}

func (m *mockAuthUserRepo) FindAll(_ context.Context) ([]*entity.User, error) {
	return nil, nil
}

func (m *mockAuthUserRepo) FindByID(_ context.Context, id uint) (*entity.User, error) {
	if m.findByIDErr != nil {
		return nil, m.findByIDErr
	}
	u, ok := m.users[id]
	if !ok {
		return nil, nil
	}
	return u, nil
}

func (m *mockAuthUserRepo) FindByEmail(_ context.Context, email string) (*entity.User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, repository.ERR_RECORD_NOT_FOUND
}

func (m *mockAuthUserRepo) FindByUsername(_ context.Context, username string) (*entity.User, error) {
	for _, u := range m.users {
		if u.Username == username {
			return u, nil
		}
	}
	return nil, repository.ERR_RECORD_NOT_FOUND
}

func (m *mockAuthUserRepo) Create(_ context.Context, user *entity.User) error {
	m.users[user.ID] = user
	return nil
}

func (m *mockAuthUserRepo) Update(_ context.Context, user *entity.User) error {
	if _, ok := m.users[user.ID]; !ok {
		return errors.New("not found")
	}
	m.users[user.ID] = user
	return nil
}

func (m *mockAuthUserRepo) UpdatePasswordByEmail(_ context.Context, email, hashedPassword string) error {
	for _, u := range m.users {
		if u.Email == email {
			u.Password = hashedPassword
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockAuthUserRepo) DeleteProfileLinksByUserID(_ context.Context, userID uint) error {
	return nil
}

func (m *mockAuthUserRepo) Delete(_ context.Context, id uint) error {
	return nil
}

type mockResetTokenRepo struct {
	tokens map[string]*authEntity.PasswordResetToken
}

func (m *mockResetTokenRepo) Create(_ context.Context, t *authEntity.PasswordResetToken) error {
	m.tokens[t.Token] = t
	return nil
}

func (m *mockResetTokenRepo) FindByToken(_ context.Context, token string) (*authEntity.PasswordResetToken, error) {
	t, ok := m.tokens[token]
	if !ok {
		return nil, errors.New("token not found")
	}
	if time.Now().After(t.ExpiresAt) {
		return nil, errors.New("token expired")
	}
	return t, nil
}

func (m *mockResetTokenRepo) MarkUsed(_ context.Context, id uint) error {
	return nil
}

func newAuthService(userRepo *mockAuthUserRepo, resetRepo *mockResetTokenRepo) *AuthService {
	var resetRepoImpl authRepo.PasswordResetTokenRepository = resetRepo
	var userRepoImpl repository.UserRepository = userRepo
	return NewAuthService(userRepoImpl, resetRepoImpl, nil)
}

func TestAuthService_CreateUser_Success(t *testing.T) {
	userRepo := &mockAuthUserRepo{users: make(map[uint]*entity.User)}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	user := &entity.User{ID: 1, FirstName: "John", Email: "john@test.com", Password: "Secret123"}
	err := svc.CreateUser(context.Background(), user)
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if user.Password == "Secret123" {
		t.Error("password should be hashed")
	}
	if !utils.CompareHashAndPassword(user.Password, "Secret123") {
		t.Error("hashed password should match original")
	}
}

func TestAuthService_CreateUser_EmailAlreadyUsed(t *testing.T) {
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Email: "existing@test.com"}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	user := &entity.User{ID: 2, Email: "existing@test.com", Password: "Secret123"}
	err := svc.CreateUser(context.Background(), user)
	if err != ErrEmailAlreadyUsed {
		t.Errorf("expected ErrEmailAlreadyUsed, got %v", err)
	}
}

func TestAuthService_ProcessLogin_Success(t *testing.T) {
	hashed, _ := utils.HashPassword("Secret123")
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Email: "john@test.com", Password: hashed}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	u, err := svc.ProcessLogin(context.Background(), "john@test.com", "Secret123")
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if u.Email != "john@test.com" {
		t.Errorf("expected 'john@test.com', got '%s'", u.Email)
	}
}

func TestAuthService_ProcessLogin_UserNotFound(t *testing.T) {
	userRepo := &mockAuthUserRepo{users: make(map[uint]*entity.User)}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	_, err := svc.ProcessLogin(context.Background(), "nobody@test.com", "pass123")
	if err != ErrUserNotFound {
		t.Errorf("expected ErrUserNotFound, got %v", err)
	}
}

func TestAuthService_ProcessLogin_WrongPassword(t *testing.T) {
	hashed, _ := utils.HashPassword("CorrectPass1")
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Email: "john@test.com", Password: hashed}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	_, err := svc.ProcessLogin(context.Background(), "john@test.com", "WrongPass1")
	if err != ErrInvalidPassword {
		t.Errorf("expected ErrInvalidPassword, got %v", err)
	}
}

func TestAuthService_ChangePassword_Success(t *testing.T) {
	hashed, _ := utils.HashPassword("OldPass1")
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Email: "john@test.com", Password: hashed}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	_, err := svc.ChangePassword(context.Background(), 1, "OldPass1", "NewPass123")
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if userRepo.users[1].Password == hashed {
		t.Error("password should be updated")
	}
}

func TestAuthService_ChangePassword_WrongOldPassword(t *testing.T) {
	hashed, _ := utils.HashPassword("OldPass1")
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Email: "john@test.com", Password: hashed}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	_, err := svc.ChangePassword(context.Background(), 1, "WrongPass", "NewPass123")
	if err != ErrInvalidOldPassword {
		t.Errorf("expected ErrInvalidOldPassword, got %v", err)
	}
}

func TestAuthService_SetUsername_Success(t *testing.T) {
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, FirstName: "John"}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	u, err := svc.SetUsername(context.Background(), 1, "johnny")
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if u.Username != "johnny" {
		t.Errorf("expected 'johnny', got '%s'", u.Username)
	}
}

func TestAuthService_SetUsername_AlreadyTaken(t *testing.T) {
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{
			1: {ID: 1, Username: "johnny"},
			2: {ID: 2, FirstName: "Other"},
		},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	_, err := svc.SetUsername(context.Background(), 2, "johnny")
	if err == nil {
		t.Fatal("expected error, got nil")
	}
}

func TestAuthService_UpdateProfile_Success(t *testing.T) {
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, FirstName: "John", Email: "john@test.com"}},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	req := &request.UpdateUserRequest{
		FirstName: "Jane",
		LastName:  "Doe",
		Email:     "jane@test.com",
	}
	u, err := svc.UpdateProfile(context.Background(), 1, req)
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if u.FirstName != "Jane" {
		t.Errorf("expected 'Jane', got '%s'", u.FirstName)
	}
	if u.Email != "jane@test.com" {
		t.Errorf("expected 'jane@test.com', got '%s'", u.Email)
	}
}

func TestAuthService_UpdateProfile_EmailAlreadyUsed(t *testing.T) {
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{
			1: {ID: 1, FirstName: "John", Email: "john@test.com"},
			2: {ID: 2, Email: "other@test.com"},
		},
	}
	resetRepo := &mockResetTokenRepo{tokens: make(map[string]*authEntity.PasswordResetToken)}
	svc := newAuthService(userRepo, resetRepo)

	req := &request.UpdateUserRequest{
		FirstName: "John",
		Email:     "other@test.com",
	}
	_, err := svc.UpdateProfile(context.Background(), 1, req)
	if err != ErrEmailAlreadyUsed {
		t.Errorf("expected ErrEmailAlreadyUsed, got %v", err)
	}
}

func TestAuthService_ResetPassword_Success(t *testing.T) {
	userRepo := &mockAuthUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Email: "john@test.com", Password: "oldhash"}},
	}
	resetRepo := &mockResetTokenRepo{
		tokens: map[string]*authEntity.PasswordResetToken{
			"valid-token": {ID: 1, Email: "john@test.com", ExpiresAt: time.Now().Add(1 * time.Hour)},
		},
	}
	svc := newAuthService(userRepo, resetRepo)

	err := svc.ResetPassword(context.Background(), "valid-token", "NewPass123")
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if userRepo.users[1].Password == "oldhash" {
		t.Error("password should be updated")
	}
}


