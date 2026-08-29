package errs

import (
	"ruang-tukar/internal/pkg/utils"
)

const (
	CodeUserNotFound     = "AUTH_USER_NOT_FOUND"
	CodeEmailAlreadyUsed = "AUTH_EMAIL_ALREADY_USED"
	CodeInvalidPassword  = "AUTH_INVALID_PASSWORD"
	CodeUsernameTaken    = "AUTH_USERNAME_TAKEN"
	CodeTokenExpired     = "AUTH_TOKEN_EXPIRED"
	CodeTokenInvalid     = "AUTH_TOKEN_INVALID"
	CodeTokenAlreadyUsed = "AUTH_TOKEN_ALREADY_USED"
	CodeUnauthorized     = "AUTH_UNAUTHORIZED"
)

var (
	ErrUserNotFound     = utils.NewAppError(CodeUserNotFound, "User not found")
	ErrEmailAlreadyUsed = utils.NewAppError(CodeEmailAlreadyUsed, "Email already registered")
	ErrInvalidPassword  = utils.NewAppError(CodeInvalidPassword, "Incorrect password")
	ErrUsernameTaken    = utils.NewAppError(CodeUsernameTaken, "Username is already taken")
	ErrTokenExpired     = utils.NewAppError(CodeTokenExpired, "Token has expired")
	ErrTokenInvalid     = utils.NewAppError(CodeTokenInvalid, "Invalid token")
	ErrTokenAlreadyUsed = utils.NewAppError(CodeTokenAlreadyUsed, "Token has already been used")
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
