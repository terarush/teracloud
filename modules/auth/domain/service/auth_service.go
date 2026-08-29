package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"html/template"
	"os"
	"strings"
	"time"

	"ruang-tukar/internal/pkg/jwt"
	"ruang-tukar/internal/pkg/mailer"
	"ruang-tukar/internal/pkg/utils"
	authEntity "ruang-tukar/modules/auth/domain/entity"
	authRepo "ruang-tukar/modules/auth/domain/repository"
	authErrs "ruang-tukar/modules/auth/errs"
	"ruang-tukar/modules/users/domain/entity"
	"ruang-tukar/modules/users/domain/repository"
	"ruang-tukar/modules/users/dto/request"
)

var (
	ErrUserNotFound       = authErrs.ErrUserNotFound
	ErrEmailAlreadyUsed   = authErrs.ErrEmailAlreadyUsed
	ErrInvalidPassword    = authErrs.ErrInvalidPassword
	ErrInvalidOldPassword = errors.New("kata sandi lama salah")
	ErrUsernameTaken      = authErrs.ErrUsernameTaken
)

type AuthService struct {
	userRepo  repository.UserRepository
	resetRepo authRepo.PasswordResetTokenRepository
	jwt       jwt.JWT
	mail      *mailer.Mailer
}

func NewAuthService(userRepo repository.UserRepository, resetRepo authRepo.PasswordResetTokenRepository, mail *mailer.Mailer) *AuthService {
	if userRepo == nil {
		panic("userRepo cannot be nil")
	}
	return &AuthService{
		userRepo:  userRepo,
		resetRepo: resetRepo,
		mail:      mail,
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

	hashedPassword, err := utils.HashPassword(user.Password)
	if err != nil {
		return err
	}
	user.Password = hashedPassword

	return s.userRepo.Create(ctx, user)
}

func (s *AuthService) ProcessLogin(ctx context.Context, email, password string) (*entity.User, error) {
	if email == "" || password == "" {
		return nil, errors.New("email and password cannot be empty")
	}

	existingUser, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		if err == repository.ERR_RECORD_NOT_FOUND {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	if !utils.CompareHashAndPassword(existingUser.Password, password) {
		return nil, ErrInvalidPassword
	}

	return existingUser, nil
}

func (s *AuthService) ChangePassword(ctx context.Context, userID uint, oldPassword, newPassword string) (*entity.User, error) {
	if oldPassword == "" || newPassword == "" {
		return nil, errors.New("password cannot be empty")
	}

	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	if !utils.CompareHashAndPassword(user.Password, oldPassword) {
		return nil, ErrInvalidOldPassword
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user.Password = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, errors.New("failed to update password")
	}

	return user, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, id uint) (*entity.User, error) {
	user, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *AuthService) GetUserByEmail(ctx context.Context, email string) (*entity.User, error) {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) GetUserByUsername(ctx context.Context, username string) (*entity.User, error) {
	user, err := s.userRepo.FindByUsername(ctx, username)
	if err != nil {
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
	user.Banner = req.Banner
	user.Bio = req.Bio
	user.Location = req.Location
	user.Website = req.Website

	if req.Links != nil {
		maxLinks := len(req.Links)
		if maxLinks > entity.MaxProfileLinks {
			maxLinks = entity.MaxProfileLinks
		}
		newLinks := make([]entity.UserProfileLink, maxLinks)
		for i := 0; i < maxLinks; i++ {
			newLinks[i] = entity.UserProfileLink{
				UserID:    user.ID,
				Title:     req.Links[i].Title,
				URL:       req.Links[i].URL,
				Icon:      req.Links[i].Icon,
				SortOrder: i,
			}
		}
		// Clear existing links & set new links
		_ = s.userRepo.DeleteProfileLinksByUserID(ctx, user.ID)
		user.Links = newLinks
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) UpdateUser(ctx context.Context, user *entity.User) error {
	return s.userRepo.Update(ctx, user)
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
		return nil, authErrs.ErrUsernameTaken
	}

	user.Username = username
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *AuthService) RefreshAccessToken(ctx context.Context, refreshToken string) (string, int64, error) {
	claims, err := s.jwt.ParseToken(refreshToken)
	if err != nil {
		return "", 0, errors.New("invalid refresh token")
	}
	typ, _ := claims["type"].(string)
	if typ != "refresh" {
		return "", 0, errors.New("invalid token type")
	}

	userID := uint(claims["user_id"].(float64))
	user, err := s.userRepo.FindByID(ctx, userID)
	if err != nil {
		return "", 0, ErrUserNotFound
	}

	tokenData := map[string]any{
		"user_id": user.ID,
		"email":   user.Email,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"role":    user.Role,
		"type":    "access",
	}
	token, err := s.jwt.GenerateToken(tokenData)
	if err != nil {
		return "", 0, err
	}
	return token, 86400, nil
}

func (s *AuthService) ForgotPassword(ctx context.Context, email string) error {
	user, err := s.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return nil
	}

	tokenBytes := make([]byte, 32)
	if _, err := rand.Read(tokenBytes); err != nil {
		return err
	}
	token := hex.EncodeToString(tokenBytes)

	now := time.Now()
	resetToken := &authEntity.PasswordResetToken{
		Email:     user.Email,
		Token:     token,
		ExpiresAt: now.Add(1 * time.Hour),
		CreatedAt: now,
	}
	if err := s.resetRepo.Create(ctx, resetToken); err != nil {
		return err
	}

	if s.mail == nil {
		return nil
	}

	frontendURL := os.Getenv("APP_FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	resetURL := fmt.Sprintf("%s/reset-password?token=%s", strings.TrimRight(frontendURL, "/"), token)

	appName := os.Getenv("APP_NAME")
	appName = strings.ReplaceAll(appName, "-", " ")
	if len(appName) > 0 {
		appName = strings.ToUpper(appName[:1]) + appName[1:]
	}

	body, err := mailer.RenderTemplate(mailer.EmailData{
		AppName:     appName,
		Domain:      strings.TrimPrefix(frontendURL, "https://"),
		Title:       "Reset Password",
		Body:        template.HTML(fmt.Sprintf("Kami menerima permintaan reset password untuk akun <strong>%s</strong>. Klik tombol di bawah untuk mereset password kamu. Tautan berlaku selama 1 jam.", user.Email)),
		ActionURL:   resetURL,
		ActionLabel: "Reset Password",
		Extra:       "Jika kamu tidak meminta reset password, abaikan email ini.",
	})
	if err != nil {
		return err
	}

	return s.mail.Send(user.Email, "Reset Password - Ruang Tukar", body)
}

func (s *AuthService) VerifyResetToken(ctx context.Context, token string) error {
	_, err := s.resetRepo.FindByToken(ctx, token)
	return err
}

func (s *AuthService) ResetPassword(ctx context.Context, token, newPassword string) error {
	resetToken, err := s.resetRepo.FindByToken(ctx, token)
	if err != nil {
		return errors.New("token tidak valid atau sudah kedaluwarsa")
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	if err := s.userRepo.UpdatePasswordByEmail(ctx, resetToken.Email, hashedPassword); err != nil {
		return err
	}

	return s.resetRepo.MarkUsed(ctx, resetToken.ID)
}
