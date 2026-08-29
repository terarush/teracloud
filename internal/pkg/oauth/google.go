package oauth

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

var GoogleOAuthConfig *oauth2.Config

func InitGoogleOAuth() {
	clientID := os.Getenv("OAUTH2_GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("OAUTH2_GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("OAUTH2_GOOGLE_REDIRECT_URL")
	if redirectURL == "" {
		frontendURL := os.Getenv("APP_FRONTEND_URL")
		if frontendURL == "" {
			return
		}
		redirectURL = fmt.Sprintf("%s/api/v1/auth/google/callback", strings.TrimRight(frontendURL, "/"))
	}

	if clientID == "" {
		return
	}

	GoogleOAuthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
}

// GoogleUserInfo represents the user info returned by Google.
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
}

// GetGoogleUserInfo exchanges the code for a token and fetches user info.
func GetGoogleUserInfo(ctx context.Context, code string) (*GoogleUserInfo, error) {
	if GoogleOAuthConfig == nil {
		return nil, fmt.Errorf("google oauth not configured")
	}
	token, err := GoogleOAuthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %w", err)
	}

	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + token.AccessToken)
	if err != nil {
		return nil, fmt.Errorf("userinfo request failed: %w", err)
	}
	defer resp.Body.Close()

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("userinfo decode failed: %w", err)
	}
	return &userInfo, nil
}
