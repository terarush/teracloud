package utils

import (
	"errors"
	"net/http"
)

// AppError is an error carrying an i18n key (Code) plus a human-readable
// fallback message. Handlers return AppError so the response layer can
// serialize { code, message }; the web client maps Code to a localized
// string and falls back to Message when no translation exists.
type AppError struct {
	Code    string
	Message string
}

func (e *AppError) Error() string { return e.Message }

// NewAppError builds an error with an i18n key and fallback message.
func NewAppError(code, message string) error {
	return &AppError{Code: code, Message: message}
}

// CodeOf returns the AppError code carried by err, or "" when err is not
// (or does not wrap) an *AppError.
func CodeOf(err error) string {
	var ae *AppError
	if errors.As(err, &ae) && ae.Code != "" {
		return ae.Code
	}
	return ""
}

// Error codes consumed by the web client as i18n keys. Per-domain codes
// (AUTH_*, USER_*, PRODUCT_*, ...) are defined in each module's errs package.
const (
	CodeBadRequest    = "BAD_REQUEST"
	CodeValidation    = "VALIDATION_ERROR"
	CodeUnauthorized  = "UNAUTHORIZED"
	CodeForbidden     = "FORBIDDEN"
	CodeNotFound      = "NOT_FOUND"
	CodeConflict      = "CONFLICT"
	CodeInternal      = "INTERNAL_ERROR"
	CodeUnavailable   = "SERVICE_UNAVAILABLE"
)

// CodeForStatus maps an HTTP status to a default error code, used when the
// error passed to a response helper carries no AppError code of its own.
func CodeForStatus(status int) string {
	switch status {
	case http.StatusBadRequest:
		return CodeBadRequest
	case http.StatusUnauthorized:
		return CodeUnauthorized
	case http.StatusForbidden:
		return CodeForbidden
	case http.StatusNotFound:
		return CodeNotFound
	case http.StatusConflict:
		return CodeConflict
	case http.StatusServiceUnavailable:
		return CodeUnavailable
	default:
		return CodeInternal
	}
}
