package validator

import (
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"

	"github.com/go-playground/validator"
)

// CustomValidator is a custom validator for Echo
type CustomValidator struct {
	validator *validator.Validate
}

// NewCustomValidator
func NewCustomValidator() *CustomValidator {
	return &CustomValidator{
		validator: validator.New(),
	}
}

// Validate validates a struct
func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return err
	}
	return nil
}

// tagMessages maps built-in validator tags to Indonesian messages.
// Tags with dynamic params (min, max, len) format via fmt.Sprintf.
var tagMessages = map[string]string{
	"required": "wajib diisi",
	"email":    "format email tidak valid",
	"min":      "minimal %s karakter",
	"max":      "maksimal %s karakter",
	"len":      "harus %s karakter",
	"numeric":  "harus berupa angka",
	"oneof":    "harus salah satu dari: %s",
}

// TranslateError converts validator.ValidationErrors into Indonesian messages.
// fieldLabels maps struct field names to human-readable labels (e.g. "Email" -> "Email").
func TranslateError(err error, fieldLabels map[string]string) []string {
	var msgs []string

	var errs validator.ValidationErrors
	if !errors.As(err, &errs) {
		return append(msgs, err.Error())
	}

	for _, e := range errs {
		label := fieldLabel(e.Field(), fieldLabels)
		tpl, ok := tagMessages[e.Tag()]
		if !ok {
			tpl = "tidak valid"
		}

		if strings.Contains(tpl, "%s") && e.Param() != "" {
			msgs = append(msgs, fmt.Sprintf("%s %s", label, fmt.Sprintf(tpl, e.Param())))
		} else {
			msgs = append(msgs, fmt.Sprintf("%s %s", label, tpl))
		}
	}

	return msgs
}

func fieldLabel(field string, labels map[string]string) string {
	if l, ok := labels[field]; ok {
		return l
	}
	return field
}

// usernameRe allows letters, digits, underscores, hyphens and dots.
var usernameRe = regexp.MustCompile(`^[a-zA-Z0-9_.-]+$`)

// IsValidEmail reports whether s is a valid RFC 5322 email address.
func IsValidEmail(s string) bool {
	addr, err := mail.ParseAddress(s)
	return err == nil && addr.Address == s
}

// IsValidUsername reports whether s is a valid username (3-50 chars,
// letters/digits/underscore/hyphen/dot only).
func IsValidUsername(s string) bool {
	l := len(s)
	return l >= 3 && l <= 50 && usernameRe.MatchString(s)
}
