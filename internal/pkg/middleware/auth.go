package middleware

import (
	"fmt"
	"net/http"
	"ruang-tukar/internal/pkg/jwt"
	"strings"

	"github.com/labstack/echo/v5"
)

var jwtService jwt.JWT

// Role constants — single source of truth for role strings used in JWT claims
// and RequireRole gates.
const (
	RoleAdmin = "admin"
	RoleUser  = "user"
)

func InitializeAuth(service jwt.JWT) {
	jwtService = service
}

// authenticate validates the Bearer token and stores its claims in context,
// returning nil on success or an HTTP error. Shared by Auth and RequireRole.
func authenticate(c *echo.Context) error {
	authHeader := c.Request().Header.Get("Authorization")
	if authHeader == "" {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error":   "Header Authorization tidak ditemukan",
			"message": "Tidak memiliki akses",
		})
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error":   "Format header Authorization tidak valid",
			"message": "Tidak memiliki akses",
		})
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	claims, err := jwtService.ParseToken(token)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{
			"error":   fmt.Sprintf("Token tidak valid: %v", err),
			"message": "Tidak memiliki akses",
		})
	}

	c.Set("user", claims)

	return nil
}

func Auth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c *echo.Context) error {
		if err := authenticate(c); err != nil {
			return err
		}

		return next(c)
	}
}

// RequireRole authenticates the request and enforces that the token's role
// claim equals role. It is a self-contained admin gate: authenticated but
// wrong-role users get 403. Role comes from the server-signed JWT claims,
// never from client-provided cookies.
func RequireRole(role string) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			if err := authenticate(c); err != nil {
				return err
			}

			claims := c.Get("user").(map[string]interface{})
			if claims["role"] != role {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"error":   "Akses ditolak",
					"message": "Tidak memiliki akses ke sumber daya ini",
				})
			}

			return next(c)
		}
	}
}

var RequireAdmin = RequireRole(RoleAdmin)
