package errs

import (
	"ruang-tukar/internal/pkg/utils"
)

const (
	CodeUserNotFound     = "USER_NOT_FOUND"
	CodeEmailAlreadyUsed = "USER_EMAIL_ALREADY_USED"
	CodeUsernameTaken    = "USER_USERNAME_TAKEN"
	CodeUserInvalidID    = "USER_INVALID_ID"
)

var (
	ErrUserNotFound     = utils.NewAppError(CodeUserNotFound, "User not found")
	ErrEmailAlreadyUsed = utils.NewAppError(CodeEmailAlreadyUsed, "Email already registered")
	ErrUsernameTaken    = utils.NewAppError(CodeUsernameTaken, "Username is already taken")
	ErrUserInvalidID    = utils.NewAppError(CodeUserInvalidID, "Invalid user ID")
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
