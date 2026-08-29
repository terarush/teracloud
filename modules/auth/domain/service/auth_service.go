package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"time"

	"ruang-tukar/internal/pkg/mailer"
	"ruang-tukar/internal/pkg/utils"
	authEntity "ruang-tukar/modules/auth/domain/entity"
	authRepo "ruang-tukar/modules/auth/domain/repository"
	"ruang-tukar/modules/users/domain/entity"
	"ruang-tukar/modules/users/domain/repository"
	"ruang-tukar/modules/users/dto/request"
)

var (
	ErrUserNotFound        = errors.New("user not found")
	ErrInvalidPassword     = errors.New("invalid password")
	ErrInvalidOldPassword  = errors.New("invalid old password")
	ErrEmailAlreadyUsed    = errors.New("email already used")
	ErrUsernameTaken       = errors.New("username already taken")
	ErrTokenExpired        = errors.New("reset token has expired")
	ErrTokenInvalid        = errors.New("invalid reset token")
	ErrTokenAlreadyUsed    = errors.New("reset token has already been used")
	ErrUserAlreadyBanned   = errors.New("user is already banned")
	ErrUserNotBanned       = errors.New("user is not banned")
	ErrCannotBanSelf       = errors.New("cannot ban yourself")
)

type AuthService struct {
	userRepo       repository.UserRepository
	resetTokenRepo authRepo.PasswordResetTokenRepository
	mailer         *mailer.Mailer
}

func NewAuthService(
	userRepo repository.UserRepository,
	resetTokenRepo authRepo.PasswordResetTokenRepository,
	mailer *mailer.Mailer,
) *AuthService {
	return &AuthService{
		userRepo:       userRepo,
		resetTokenRepo: resetTokenRepo,
		mailer:         mailer,
	}
}

func (s *AuthService) CreateUser(ctx context.Context, user *entity.User) error {
	existingUser, err := s.userRepo.FindByEmail(ctx, user.Email)
	if err != nil && err != repository.ERR_RECORD_NOT_FOUND {
		return err
	}
	if existingUser != nil {
		return ErrEmailAlreadyUsed
	}

	if user.Username != "" {
		existingUsername, err := s.userRepo.FindByUsername(ctx, user.Username)
		if err != nil && err != repository.ERR_RECORD_NOT_FOUND {
			return err
		}
		if existingUsername != nil {
			return ErrUsernameTaken
		}
	}

	if user.Password != "" {
		hashedPassword, err := utils.HashPassword(user.Password)
		if err != nil {
			return err
		}
		user.Password = hashedPassword
	}

	return s.userRepo.Create(ctx, user)
}

func (s *AuthService) Login(ctx context.Context, email, password string) (*entity.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if err == repository.ERR_RECORD_NOT_FOUND {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	if !utils.CompareHashAndPassword(user.Password, password) {
		return nil, ErrInvalidPassword
	}

	return user, nil
}

func (s *AuthService) ProcessLogin(ctx context.Context, email, password string) (*entity.User, error) {
	return s.Login(ctx, email, password)
}

func (s *AuthService) GetUserByID(ctx context.Context, id uint) (*entity.User, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		if err == repository.ERR_RECORD_NOT_FOUND {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *AuthService) GetUserByEmail(ctx context.Context, email string) (*entity.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if err == repository.ERR_RECORD_NOT_FOUND {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *AuthService) GetUserByUsername(ctx context.Context, username string) (*entity.User, error) {
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
		if err == repository.ERR_RECORD_NOT_FOUND {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return user, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) (*entity.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if !utils.CompareHashAndPassword(user.Password, oldPassword) {
		return nil, ErrInvalidOldPassword
	}

	hashed, err := utils.HashPassword(newPassword)
	if err != nil {
		return nil, err
	}

	user.Password = hashed
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) SetUsername(ctx context.Context, userID uint, username string) (*entity.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	existing, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil && err != repository.ERR_RECORD_NOT_FOUND {
		return nil, err
	}
	if existing != nil && existing.ID != userID {
		return nil, ErrUsernameTaken
	}

	user.Username = username
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) GetProfile(ctx context.Context, userID uint) (*entity.User, error) {
	return s.GetUserByID(ctx, userID)
}

func (s *AuthService) UpdateProfile(ctx context.Context, userID uint, req *request.UpdateUserRequest) (*entity.User, error) {
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if req.Email != "" && req.Email != user.Email {
		existing, err := s.userRepo.FindByEmail(ctx, req.Email)
		if err != nil && err != repository.ERR_RECORD_NOT_FOUND {
			return nil, err
		}
		if existing != nil {
			return nil, ErrEmailAlreadyUsed
		}
		user.Email = req.Email
	}

	if req.Username != "" && req.Username != user.Username {
		existing, err := s.userRepo.FindByUsername(ctx, req.Username)
		if err != nil && err != repository.ERR_RECORD_NOT_FOUND {
			return nil, err
		}
		if existing != nil {
			return nil, ErrUsernameTaken
		}
		user.Username = req.Username
	}

	if req.FirstName != "" {
		user.FirstName = req.FirstName
	}
	user.LastName = req.LastName
	user.Avatar = req.Avatar

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) UpdateUser(ctx context.Context, user *entity.User) error {
	return s.userRepo.Update(ctx, user)
}

func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	_, err := s.RequestPasswordReset(ctx, email)
	return err
}

func (s *AuthService) RequestPasswordReset(ctx context.Context, email string) (string, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", nil // Silent return if email not found
	}

	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	token := hex.EncodeToString(b)

	resetToken := &authEntity.PasswordResetToken{
		Email:     user.Email,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}

	if err := s.resetTokenRepo.Create(ctx, resetToken); err != nil {
		return "", err
	}

	if s.mailer != nil {
		frontendURL := os.Getenv("FRONTEND_URL")
		if frontendURL == "" {
			frontendURL = "http://localhost:3000"
		}
		resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendURL, token)
		body := fmt.Sprintf(`
			<h2>Reset Kata Sandi Teracloud</h2>
			<p>Halo %s,</p>
			<p>Kami menerima permintaan untuk mereset kata sandi akun Anda.</p>
			<p><a href="%s" style="background:#0D9488;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;display:inline-block;">Reset Kata Sandi</a></p>
			<p>Tautan ini berlaku selama 1 jam.</p>
		`, user.FirstName, resetLink)

		_ = s.mailer.Send(user.Email, "Reset Kata Sandi Teracloud", body)
	}

	return token, nil
}

func (s *AuthService) VerifyResetToken(ctx context.Context, token string) error {
	rt, err := s.resetTokenRepo.FindByToken(ctx, token)
	if err != nil {
		return ErrTokenInvalid
	}
	if rt.UsedAt != nil {
		return ErrTokenAlreadyUsed
	}
	if time.Now().After(rt.ExpiresAt) {
		return ErrTokenExpired
	}
	return nil
}

func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	if err := s.VerifyResetToken(ctx, token); err != nil {
		return err
	}

	rt, err := s.resetTokenRepo.FindByToken(ctx, token)
	if err != nil {
		return err
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user, err := s.userRepo.FindByEmail(ctx, rt.Email)
	if err != nil {
		return ErrUserNotFound
	}

	user.Password = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	return s.resetTokenRepo.MarkUsed(ctx, rt.ID)
}
