package service

import (
	"context"
	"errors"
	"testing"
	"teracloud/modules/users/domain/entity"
	"teracloud/modules/users/domain/repository"
)

type mockUserRepo struct {
	users map[uint]*entity.User
	errFindByID error
}

func (m *mockUserRepo) FindAll(_ context.Context) ([]*entity.User, error) {
	var res []*entity.User
	for _, u := range m.users {
		res = append(res, u)
	}
	return res, nil
}

func (m *mockUserRepo) FindByID(_ context.Context, id uint) (*entity.User, error) {
	if m.errFindByID != nil {
		return nil, m.errFindByID
	}
	u, ok := m.users[id]
	if !ok {
		return nil, nil
	}
	return u, nil
}

func (m *mockUserRepo) FindByEmail(_ context.Context, email string) (*entity.User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, repository.ERR_RECORD_NOT_FOUND
}

func (m *mockUserRepo) FindByUsername(_ context.Context, username string) (*entity.User, error) {
	for _, u := range m.users {
		if u.Username == username {
			return u, nil
		}
	}
	return nil, repository.ERR_RECORD_NOT_FOUND
}

func (m *mockUserRepo) Create(_ context.Context, user *entity.User) error {
	m.users[user.ID] = user
	return nil
}

func (m *mockUserRepo) Update(_ context.Context, user *entity.User) error {
	if _, ok := m.users[user.ID]; !ok {
		return errors.New("not found")
	}
	m.users[user.ID] = user
	return nil
}

func (m *mockUserRepo) UpdatePasswordByEmail(_ context.Context, email, hashedPassword string) error {
	for _, u := range m.users {
		if u.Email == email {
			u.Password = hashedPassword
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockUserRepo) DeleteProfileLinksByUserID(_ context.Context, userID uint) error {
	return nil
}

func (m *mockUserRepo) Delete(_ context.Context, id uint) error {
	if _, ok := m.users[id]; !ok {
		return errors.New("not found")
	}
	delete(m.users, id)
	return nil
}

func TestUserService_GetByID_Success(t *testing.T) {
	repo := &mockUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, FirstName: "John", Email: "john@test.com"}},
	}
	svc := NewUserService(repo)

	u, err := svc.GetUserByID(context.Background(), 1)
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if u.FirstName != "John" {
		t.Errorf("expected 'John', got '%s'", u.FirstName)
	}
}

func TestUserService_GetByID_NotFound(t *testing.T) {
	repo := &mockUserRepo{users: make(map[uint]*entity.User)}
	svc := NewUserService(repo)

	_, err := svc.GetUserByID(context.Background(), 999)
	if err != ErrUserNotFound {
		t.Errorf("expected ErrUserNotFound, got %v", err)
	}
}

func TestUserService_GetByUsername_Success(t *testing.T) {
	repo := &mockUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, Username: "johndoe"}},
	}
	svc := NewUserService(repo)

	u, err := svc.GetUserByUsername(context.Background(), "johndoe")
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if u.Username != "johndoe" {
		t.Errorf("expected 'johndoe', got '%s'", u.Username)
	}
}

func TestUserService_GetByUsername_NotFound(t *testing.T) {
	repo := &mockUserRepo{users: make(map[uint]*entity.User)}
	svc := NewUserService(repo)

	_, err := svc.GetUserByUsername(context.Background(), "nonexistent")
	if err != ErrUserNotFound {
		t.Errorf("expected ErrUserNotFound, got %v", err)
	}
}

func TestUserService_UpdateUser_Success(t *testing.T) {
	repo := &mockUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, FirstName: "Old"}},
	}
	svc := NewUserService(repo)

	err := svc.UpdateUser(context.Background(), &entity.User{ID: 1, FirstName: "New"})
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if repo.users[1].FirstName != "New" {
		t.Errorf("expected 'New', got '%s'", repo.users[1].FirstName)
	}
}

func TestUserService_UpdateUser_NotFound(t *testing.T) {
	repo := &mockUserRepo{users: make(map[uint]*entity.User)}
	svc := NewUserService(repo)

	err := svc.UpdateUser(context.Background(), &entity.User{ID: 999})
	if err != ErrUserNotFound {
		t.Errorf("expected ErrUserNotFound, got %v", err)
	}
}

func TestUserService_DeleteUser_Success(t *testing.T) {
	repo := &mockUserRepo{
		users: map[uint]*entity.User{1: {ID: 1, FirstName: "John"}},
	}
	svc := NewUserService(repo)

	err := svc.DeleteUser(context.Background(), 1)
	if err != nil {
		t.Fatalf("expected nil, got %v", err)
	}
	if _, ok := repo.users[1]; ok {
		t.Error("user should be deleted")
	}
}

func TestUserService_DeleteUser_NotFound(t *testing.T) {
	repo := &mockUserRepo{users: make(map[uint]*entity.User)}
	svc := NewUserService(repo)

	err := svc.DeleteUser(context.Background(), 999)
	if err != ErrUserNotFound {
		t.Errorf("expected ErrUserNotFound, got %v", err)
	}
}
