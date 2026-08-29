package utils

import (
	"github.com/labstack/echo/v5"
	"golang.org/x/crypto/bcrypt"
)

// HashPassword hashes a plain text password
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CompareHashAndPassword verifies if the provided password matches the stored hashed password
func CompareHashAndPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

// UserIDFromCtx extracts user ID from JWT claims stored in echo context.
func UserIDFromCtx(c *echo.Context) uint {
	claims := c.Get("user")
	if claims == nil {
		return 0
	}
	if u, ok := claims.(map[string]any); ok {
		if id, ok := u["user_id"].(float64); ok {
			return uint(id)
		}
	}
	return 0
}

// UserRoleFromCtx extracts user role from JWT claims stored in echo context.
func UserRoleFromCtx(c *echo.Context) string {
	claims := c.Get("user")
	if claims == nil {
		return ""
	}
	if u, ok := claims.(map[string]any); ok {
		if role, ok := u["role"].(string); ok {
			return role
		}
	}
	return ""
}
