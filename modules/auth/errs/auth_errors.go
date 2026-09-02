package errs

import (
	"ruang-tukar/internal/pkg/utils"
)

const (
	CodeUserNotFound         = "AUTH_USER_NOT_FOUND"
	CodeEmailAlreadyUsed     = "AUTH_EMAIL_ALREADY_USED"
	CodeInvalidPassword      = "AUTH_INVALID_PASSWORD"
	CodeUsernameTaken        = "AUTH_USERNAME_TAKEN"
	CodeTokenExpired         = "AUTH_TOKEN_EXPIRED"
	CodeTokenInvalid         = "AUTH_TOKEN_INVALID"
	CodeTokenAlreadyUsed     = "AUTH_TOKEN_ALREADY_USED"
	CodeUnauthorized         = "AUTH_UNAUTHORIZED"
	CodeEmailRequired        = "AUTH_EMAIL_REQUIRED"
	CodeUsernameRequired     = "AUTH_USERNAME_REQUIRED"
	CodeTokenRequired        = "AUTH_TOKEN_REQUIRED"
	CodeInvalidOldPass       = "AUTH_INVALID_OLD_PASSWORD"
	CodeInvalidTokenType     = "AUTH_INVALID_TOKEN_TYPE"
	CodeGoogleNotConfigured  = "AUTH_GOOGLE_NOT_CONFIGURED"
	CodeGoogleCodeMissing    = "AUTH_GOOGLE_CODE_MISSING"
	CodeGoogleAuthFailed     = "AUTH_GOOGLE_AUTH_FAILED"
	CodeGoogleEmailUnverified = "AUTH_GOOGLE_EMAIL_UNVERIFIED"
	CodeUserCreateFailed     = "AUTH_USER_CREATE_FAILED"
	CodeFileNotFound         = "AUTH_FILE_NOT_FOUND"
	CodeUploadDirFailed      = "AUTH_UPLOAD_DIR_FAILED"
)

var (
	ErrUserNotFound         = utils.NewAppError(CodeUserNotFound, "User not found")
	ErrEmailAlreadyUsed     = utils.NewAppError(CodeEmailAlreadyUsed, "Email already registered")
	ErrInvalidPassword      = utils.NewAppError(CodeInvalidPassword, "Incorrect password")
	ErrUsernameTaken        = utils.NewAppError(CodeUsernameTaken, "Username is already taken")
	ErrTokenExpired         = utils.NewAppError(CodeTokenExpired, "Token has expired")
	ErrTokenInvalid         = utils.NewAppError(CodeTokenInvalid, "Invalid token")
	ErrTokenAlreadyUsed     = utils.NewAppError(CodeTokenAlreadyUsed, "Token has already been used")
	ErrEmailRequired        = utils.NewAppError(CodeEmailRequired, "Email is required")
	ErrUsernameRequired     = utils.NewAppError(CodeUsernameRequired, "Username is required")
	ErrTokenRequired        = utils.NewAppError(CodeTokenRequired, "Token is required")
	ErrInvalidOldPass       = utils.NewAppError(CodeInvalidOldPass, "Incorrect current password")
	ErrInvalidTokenType     = utils.NewAppError(CodeInvalidTokenType, "Invalid token type")
	ErrGoogleNotConfigured  = utils.NewAppError(CodeGoogleNotConfigured, "Google OAuth not configured")
	ErrGoogleCodeMissing    = utils.NewAppError(CodeGoogleCodeMissing, "Authorization code not found")
	ErrGoogleAuthFailed     = utils.NewAppError(CodeGoogleAuthFailed, "Google authentication failed")
	ErrGoogleEmailUnverified = utils.NewAppError(CodeGoogleEmailUnverified, "Google email not verified")
	ErrUserCreateFailed     = utils.NewAppError(CodeUserCreateFailed, "Failed to create user")
	ErrFileNotFound         = utils.NewAppError(CodeFileNotFound, "File not found")
	ErrUploadDirFailed      = utils.NewAppError(CodeUploadDirFailed, "Failed to create upload directory")
)

var FieldLabels = map[string]string{
	"Name":            "Name",
	"FirstName":       "First Name",
	"LastName":        "Last Name",
	"Username":        "Username",
	"Email":           "Email",
	"Password":        "Password",
	"ConfirmPassword": "Confirm Password",
}
