package handler

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sync"
	"time"

	"golang.org/x/oauth2"

	"ruang-tukar/internal/pkg/bus"
	"ruang-tukar/internal/pkg/jwt"
	"ruang-tukar/internal/pkg/logger"
	"ruang-tukar/internal/pkg/middleware"
	"ruang-tukar/internal/pkg/oauth"
	"ruang-tukar/internal/pkg/utils"
	"ruang-tukar/internal/pkg/validator"
	authErrs "ruang-tukar/modules/auth/errs"
	"ruang-tukar/modules/auth/domain/service"
	"ruang-tukar/modules/users/domain/entity"
	"ruang-tukar/modules/users/dto/request"
	"ruang-tukar/modules/users/dto/response"
	"strings"

	"github.com/labstack/echo/v5"
)

// AuthHandler struct handles HTTP request for auth.
type AuthHandler struct {
	authService  *service.AuthService
	log          *logger.Logger
	event        *bus.EventBus
	jwt          jwt.JWT
	r            *utils.Response
	refreshToken jwt.JWT
	forgotMu     sync.Mutex
	forgotReq    map[string]time.Time
	frontendURL  string
}

// NewAuthHandler creates a new auth handler.
func NewAuthHandler(log *logger.Logger, event *bus.EventBus, authService *service.AuthService, jwt jwt.JWT, refreshToken jwt.JWT, frontendURL string) *AuthHandler {
	return &AuthHandler{
		authService:  authService,
		log:          log,
		event:        event,
		jwt:          jwt,
		r:            &utils.Response{},
		refreshToken: refreshToken,
		forgotReq:    make(map[string]time.Time),
		frontendURL:  frontendURL,
	}
}

// Initialize Event Handle.
func (h *AuthHandler) Handle(event bus.Event) {
	fmt.Printf("User created: %v", event.Payload)
}

func (h *AuthHandler) generateAuthResponse(user *entity.User) (map[string]any, error) {
	tokenData := map[string]any{
		"user_id":    user.ID,
		"email":      user.Email,
		"role":       user.Role,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"type":       "access",
	}

	token, err := h.jwt.GenerateToken(tokenData)
	if err != nil {
		return nil, err
	}

	refreshData := map[string]any{
		"user_id":    user.ID,
		"email":      user.Email,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"role":       user.Role,
		"type":       "refresh",
	}

	refreshToken, err := h.refreshToken.GenerateToken(refreshData)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"access_token":  token,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    86400,
		"user":          response.FromEntity(user),
	}, nil
}

// Register handles user registration.
// @Summary Register a new user
// @Description Create a new user account with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body request.CreateUserRequest true "User registration details"
// @Success 200 {object} utils.Response{data=response.UserResponse}
// @Failure 400 {object} utils.Response
// @Failure 409 {object} utils.Response
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *echo.Context) error {
	h.log.Info("Handling register request")

	req := new(request.CreateUserRequest)
	if err := c.Bind(req); err != nil {
		h.log.Error("Failed to bind request:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}

	if err := c.Validate(req); err != nil {
		h.log.Error("Validation failed:", err)
		msgs := validator.TranslateError(err, authErrs.FieldLabels)
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	h.log.Debug("Request validated successfully:", req)

	user := entity.NewUser(req.FirstName, req.LastName, req.Username, req.Email, req.Password)
	err := h.authService.CreateUser(c.Request().Context(), user)
	if err != nil {
		if err == service.ErrEmailAlreadyUsed {
			h.log.Warn("Email already in use:", req.Email)
			return h.r.ErrorResponse(c, http.StatusConflict, authErrs.ErrEmailAlreadyUsed)
		}
		h.log.Error("Failed to create user:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	h.log.Debug("User created successfully:", user)

	h.event.Publish(bus.Event{Type: "user.created", Payload: user})
	h.log.Debug("Event 'user.created' published successfully")

	resp, err := h.generateAuthResponse(user)
	if err != nil {
		h.log.Error("Failed to generate tokens:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, resp, "User registered successfully")
}

// Login handles user login.
// @Summary Login a user
// @Description Authenticate user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body request.LoginRequest true "User login credentials"
// @Success 200 {object} map[string]any
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *echo.Context) error {
	h.log.Info("Handling login request")

	req := new(request.LoginRequest)
	if err := c.Bind(req); err != nil {
		h.log.Error("Failed to bind request:", err)
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}

	if err := c.Validate(req); err != nil {
		h.log.Error("Validation failed:", err)
		msgs := validator.TranslateError(err, authErrs.FieldLabels)
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	h.log.Debug("Request validated successfully:", req)

	user, err := h.authService.ProcessLogin(c.Request().Context(), req.Email, req.Password)
	if err != nil {
		if err == service.ErrUserNotFound || err == service.ErrInvalidPassword {
			h.log.Warn("Invalid email or password for:", req.Email)
			return h.r.ErrorResponse(c, http.StatusUnauthorized, utils.NewAppError(utils.CodeUnauthorized, "Email atau kata sandi salah"))
		}
		h.log.Error("Failed to process login:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	h.log.Debug("User authenticated successfully:", user)

	resp, err := h.generateAuthResponse(user)
	if err != nil {
		h.log.Error("Failed to generate tokens:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, resp, "Login successful")
}

// GetProfile retrieves the authenticated user's profile.
// @Summary Get user profile
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response{data=response.UserResponse}
// @Router /auth/profile [get]
func (h *AuthHandler) GetProfile(c *echo.Context) error {
	h.log.Info("Handling get profile request")

	claims := c.Get("user").(map[string]any)
	userID := uint(claims["user_id"].(float64))

	user, err := h.authService.GetProfile(c.Request().Context(), userID)
	if err != nil {
		if err == service.ErrUserNotFound {
			return h.r.ErrorResponse(c, http.StatusNotFound, utils.NewAppError(utils.CodeNotFound, "Pengguna tidak ditemukan"))
		}
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "Profil berhasil diambil")
}

// UpdateProfile updates the authenticated user's profile.
// @Summary Update user profile
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.UpdateUserRequest true "Profile update request"
// @Success 200 {object} utils.Response{data=response.UserResponse}
// @Router /auth/profile [put]
func (h *AuthHandler) UpdateProfile(c *echo.Context) error {
	h.log.Info("Handling update profile request")

	claims := c.Get("user").(map[string]any)
	userID := uint(claims["user_id"].(float64))

	req := new(request.UpdateUserRequest)
	if err := c.Bind(req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}
	if err := c.Validate(req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}

	user, err := h.authService.UpdateProfile(c.Request().Context(), userID, req)
	if err != nil {
		if err == service.ErrEmailAlreadyUsed {
			return h.r.ErrorResponse(c, http.StatusConflict, utils.NewAppError(utils.CodeConflict, "Email sudah digunakan"))
		}
		if err == service.ErrUsernameTaken {
			return h.r.ErrorResponse(c, http.StatusConflict, utils.NewAppError(utils.CodeConflict, "Username sudah digunakan"))
		}
		if err == service.ErrUserNotFound {
			return h.r.ErrorResponse(c, http.StatusNotFound, utils.NewAppError(utils.CodeNotFound, "Pengguna tidak ditemukan"))
		}
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "Profil berhasil diperbarui")
}

type setUsernameRequest struct {
	Username string `json:"username" validate:"required,min=3,max=50"`
}

// SetUsername sets username for first-time Google OAuth users.
func (h *AuthHandler) SetUsername(c *echo.Context) error {
	claims := c.Get("user").(map[string]any)
	userID := uint(claims["user_id"].(float64))

	req := new(setUsernameRequest)
	if err := c.Bind(req); err != nil {
		return h.r.BadRequestResponse(c, err)
	}
	if err := c.Validate(req); err != nil {
		msgs := validator.TranslateError(err, authErrs.FieldLabels)
		return h.r.BadRequestResponse(c, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	user, err := h.authService.SetUsername(c.Request().Context(), userID, req.Username)
	if err != nil {
		if err == authErrs.ErrUsernameTaken {
			return h.r.ConflictResponse(c, authErrs.ErrUsernameTaken)
		}
		return h.r.InternalServerErrorResponse(c, err)
	}

	return h.r.SuccessResponse(c, response.FromEntity(user), "Username berhasil diatur")
}

// ChangePassword handles password change request.
// @Summary Change user password
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body request.ChangePasswordRequest true "Password change request"
// @Success 200 {object} utils.Response
// @Router /auth/change-password [post]
func (h *AuthHandler) ChangePassword(c *echo.Context) error {
	h.log.Info("Handling change password request")

	claims := c.Get("user").(map[string]any)
	userID := uint(claims["user_id"].(float64))

	req := new(request.ChangePasswordRequest)
	if err := c.Bind(req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}
	if err := c.Validate(req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}

	_, err := h.authService.ChangePassword(c.Request().Context(), userID, req.OldPassword, req.NewPassword)
	if err != nil {
		if err == service.ErrInvalidOldPassword {
			return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "Kata sandi lama salah"))
		}
		if err == service.ErrUserNotFound {
			return h.r.ErrorResponse(c, http.StatusNotFound, utils.NewAppError(utils.CodeNotFound, "Pengguna tidak ditemukan"))
		}
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, nil, "Kata sandi berhasil diubah")
}

// Logout handles user logout.
// @Summary User logout
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} utils.Response
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *echo.Context) error {
	h.log.Info("Handling logout request")
	return h.r.SuccessResponse(c, nil, "Logout berhasil")
}

// Refresh handles token refresh.
// @Summary Refresh access token
// @Description Exchange a valid refresh token for a new access token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body object{refresh_token=string} true "Refresh token"
// @Success 200 {object} map[string]any
// @Failure 400 {object} utils.Response
// @Failure 401 {object} utils.Response
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *echo.Context) error {
	h.log.Info("Handling token refresh request")

	req := struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}{}
	if err := c.Bind(&req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}

	claims, err := h.refreshToken.ParseToken(req.RefreshToken)
	if err != nil {
		h.log.Warn("Invalid refresh token:", err)
		return h.r.ErrorResponse(c, http.StatusUnauthorized, utils.NewAppError(utils.CodeUnauthorized, "Token tidak valid atau kedaluwarsa"))
	}

	typ, _ := claims["type"].(string)
	if typ != "refresh" {
		return h.r.ErrorResponse(c, http.StatusUnauthorized, utils.NewAppError(utils.CodeUnauthorized, "Tipe token tidak valid"))
	}

	userID := uint(claims["user_id"].(float64))
	user, err := h.authService.GetUserByID(c.Request().Context(), userID)
	if err != nil {
		h.log.Error("User not found for refresh:", err)
		return h.r.ErrorResponse(c, http.StatusUnauthorized, utils.NewAppError(utils.CodeUnauthorized, "Pengguna tidak ditemukan"))
	}

	resp, err := h.generateAuthResponse(user)
	if err != nil {
		h.log.Error("Failed to generate tokens:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, resp, "Token refreshed successfully")
}

// CheckEmail checks if email is already registered.
// @Summary Check email availability
// @Tags auth
// @Accept json
// @Produce json
// @Param email query string true "Email to check"
// @Success 200 {object} utils.Response
// @Router /auth/check-email [get]
func (h *AuthHandler) CheckEmail(c *echo.Context) error {
	email := c.QueryParam("email")
	if email == "" {
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "Email wajib diisi"))
	}

	_, err := h.authService.GetUserByEmail(c.Request().Context(), email)
	available := err != nil

	return h.r.SuccessResponse(c, map[string]bool{"available": available}, "ok")
}

// CheckUsername checks if username is already registered.
// @Summary Check username availability
// @Tags auth
// @Accept json
// @Produce json
// @Param username query string true "Username to check"
// @Success 200 {object} utils.Response
// @Router /auth/check-username [get]
func (h *AuthHandler) CheckUsername(c *echo.Context) error {
	username := c.QueryParam("username")
	if username == "" {
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "Username wajib diisi"))
	}

	_, err := h.authService.GetUserByUsername(c.Request().Context(), username)
	available := err != nil

	return h.r.SuccessResponse(c, map[string]bool{"available": available}, "ok")
}

// ForgotPassword sends a password reset email.
// @Summary Send password reset link
// @Tags auth
// @Accept json
// @Produce json
// @Param request body map[string]string true "Email address"
// @Success 200 {object} utils.Response
// @Router /auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(c *echo.Context) error {
	h.log.Info("Handling forgot password request")

	req := struct {
		Email string `json:"email" validate:"required,email"`
	}{}
	if err := c.Bind(&req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}
	if err := c.Validate(&req); err != nil {
		msgs := validator.TranslateError(err, authErrs.FieldLabels)
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	// Rate limit: max 1 request per 60s per email
	h.forgotMu.Lock()
	if last, ok := h.forgotReq[req.Email]; ok && time.Since(last) < 60*time.Second {
		h.forgotMu.Unlock()
		return h.r.SuccessResponse(c, nil, "Jika email terdaftar, tautan reset akan dikirim")
	}
	h.forgotReq[req.Email] = time.Now()
	h.forgotMu.Unlock()

	// Always return success to prevent email enumeration
	if err := h.authService.ForgotPassword(c.Request().Context(), req.Email); err != nil {
		h.log.Error("Forgot password error:", err)
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	return h.r.SuccessResponse(c, nil, "Jika email terdaftar, tautan reset akan dikirim")
}

// VerifyResetToken checks if a reset token is still valid.
// @Summary Verify reset token
// @Tags auth
// @Param token query string true "Reset token"
// @Success 200 {object} utils.Response
// @Router /auth/verify-reset-token [get]
func (h *AuthHandler) VerifyResetToken(c *echo.Context) error {
	token := c.QueryParam("token")
	if token == "" {
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "Token wajib diisi"))
	}
	if err := h.authService.VerifyResetToken(c.Request().Context(), token); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "Token tidak valid atau sudah kedaluwarsa"))
	}
	return h.r.SuccessResponse(c, nil, "Token valid")
}

// ResetPassword resets the user's password.
// @Summary Reset password with token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body map[string]string true "Token and new password"
// @Success 200 {object} utils.Response
// @Router /auth/reset-password [post]
func (h *AuthHandler) ResetPassword(c *echo.Context) error {
	h.log.Info("Handling reset password request")

	req := struct {
		Token       string `json:"token" validate:"required"`
		NewPassword string `json:"new_password" validate:"required,min=6"`
	}{}
	if err := c.Bind(&req); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}
	if err := c.Validate(&req); err != nil {
		msgs := validator.TranslateError(err, authErrs.FieldLabels)
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeValidation, strings.Join(msgs, ". ")))
	}

	if err := h.authService.ResetPassword(c.Request().Context(), req.Token, req.NewPassword); err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, err)
	}

	return h.r.SuccessResponse(c, nil, "Password berhasil direset")
}

// GoogleLogin redirects to Google OAuth consent screen.
func (h *AuthHandler) GoogleLogin(c *echo.Context) error {
	if oauth.GoogleOAuthConfig == nil {
		return h.r.ErrorResponse(c, http.StatusServiceUnavailable, utils.NewAppError(utils.CodeUnavailable, "Google OAuth tidak dikonfigurasi"))
	}
	url := oauth.GoogleOAuthConfig.AuthCodeURL("state", oauth2.AccessTypeOffline)
	return c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback handles the Google OAuth callback.
func (h *AuthHandler) GoogleCallback(c *echo.Context) error {
	code := c.QueryParam("code")
	if code == "" {
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "Kode otorisasi tidak ditemukan"))
	}

	userInfo, err := oauth.GetGoogleUserInfo(c.Request().Context(), code)
	if err != nil {
		h.log.Error("Google OAuth error:", err)
		return h.r.ErrorResponse(c, http.StatusUnauthorized, utils.NewAppError(utils.CodeUnauthorized, "Autentikasi Google gagal"))
	}

	if !userInfo.VerifiedEmail {
		return h.r.ErrorResponse(c, http.StatusUnauthorized, utils.NewAppError(utils.CodeUnauthorized, "Email Google belum diverifikasi"))
	}

	user, err := h.authService.GetUserByEmail(c.Request().Context(), userInfo.Email)
	if err != nil {
		user = entity.NewGoogleUser(userInfo.Name, "", userInfo.Email, userInfo.ID, userInfo.Picture)
		if err := h.authService.CreateUser(c.Request().Context(), user); err != nil {
			h.log.Error("Failed to create user from Google:", err)
			return h.r.ErrorResponse(c, http.StatusInternalServerError, utils.NewAppError(utils.CodeInternal, "Gagal membuat akun"))
		}
	} else if userInfo.Picture != "" {
		user.Avatar = userInfo.Picture
		_ = h.authService.UpdateUser(c.Request().Context(), user)
	}

	resp, err := h.generateAuthResponse(user)
	if err != nil {
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	redirectURL := fmt.Sprintf("%s/oauth2/google/callback?token=%s", h.frontendURL, resp["access_token"])
	if user.Username == "" {
		redirectURL += "&needs_username=1"
	}
	return c.Redirect(http.StatusTemporaryRedirect, redirectURL)
}

// UploadFile handles file upload and saves it to ./public/uploads
func (h *AuthHandler) UploadFile(c *echo.Context) error {
	file, err := c.FormFile("file")
	if err != nil {
		return h.r.ErrorResponse(c, http.StatusBadRequest, utils.NewAppError(utils.CodeBadRequest, "File tidak ditemukan"))
	}

	src, err := file.Open()
	if err != nil {
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}
	defer src.Close()

	uploadDir := "./public/uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return h.r.ErrorResponse(c, http.StatusInternalServerError, utils.NewAppError(utils.CodeInternal, "Gagal membuat direktori upload"))
	}

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(file.Filename))
	dstPath := filepath.Join(uploadDir, filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}
	defer dst.Close()

	if _, err = io.Copy(dst, src); err != nil {
		return h.r.ErrorResponse(c, http.StatusInternalServerError, err)
	}

	fileURL := fmt.Sprintf("/public/uploads/%s", filename)
	return h.r.SuccessResponse(c, map[string]string{"url": fileURL}, "File berhasil diunggah")
}

// RegisterRoutes sets up the auth routes.
func (h *AuthHandler) RegisterRoutes(e *echo.Echo, basePath string) {
	group := e.Group(basePath + "/auth")
	group.GET("/check-email", h.CheckEmail)
	group.GET("/check-username", h.CheckUsername)
	group.POST("/register", h.Register)
	group.POST("/login", h.Login)
	group.POST("/refresh", h.Refresh)
	group.GET("/verify-reset-token", h.VerifyResetToken)
	group.POST("/forgot-password", h.ForgotPassword)
	group.POST("/reset-password", h.ResetPassword)
	group.GET("/google/login", h.GoogleLogin)
	group.GET("/google/callback", h.GoogleCallback)

	protected := e.Group(basePath+"/auth", middleware.Auth)
	protected.GET("/profile", h.GetProfile)
	protected.PUT("/profile", h.UpdateProfile)
	protected.POST("/change-password", h.ChangePassword)
	protected.POST("/logout", h.Logout)
	protected.PUT("/username", h.SetUsername)
	protected.POST("/upload", h.UploadFile)
}
