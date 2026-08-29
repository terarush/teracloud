// internal/modules/user/interfaces/dto/response/user_response.go

package response

import (
	"ruang-tukar/modules/users/domain/entity"
	"time"
)

// UserResponse represents a user response
type UserResponse struct {
	ID           uint                       `json:"id"`
	FirstName    string                     `json:"first_name"`
	LastName     string                     `json:"last_name"`
	Username     string                     `json:"username"`
	Email        string                     `json:"email"`
	Role         string                     `json:"role"`
	Avatar       string                     `json:"avatar"`
	Banner       string                     `json:"banner"`
	Bio          string                     `json:"bio"`
	Location     string                     `json:"location"`
	Website      string                     `json:"website"`
	AuthProvider string                     `json:"auth_provider"`
	Links        []entity.UserProfileLink   `json:"links,omitempty"`
	Socials      []entity.UserSocialMedia   `json:"socials,omitempty"`
	Badges       []entity.UserBadge         `json:"badges,omitempty"`
	Sections     []entity.UserCustomSection `json:"sections,omitempty"`
	CreatedAt    time.Time                  `json:"created_at"`
	UpdatedAt    time.Time                  `json:"updated_at"`
}

// FromEntity converts a user entity to a user response
func FromEntity(user *entity.User) *UserResponse {
	return &UserResponse{
		ID:           user.ID,
		FirstName:    user.FirstName,
		LastName:     user.LastName,
		Username:     user.Username,
		Email:        user.Email,
		Role:         user.Role,
		Avatar:       user.Avatar,
		Banner:       user.Banner,
		Bio:          user.Bio,
		Location:     user.Location,
		Website:      user.Website,
		AuthProvider: user.AuthProvider,
		Links:        user.Links,
		Socials:      user.Socials,
		Badges:       user.Badges,
		Sections:     user.Sections,
		CreatedAt:    user.CreatedAt,
		UpdatedAt:    user.UpdatedAt,
	}
}

// FromEntities converts a slice of user entities to a slice of user responses
func FromEntities(users []*entity.User) []*UserResponse {
	userResponses := make([]*UserResponse, len(users))
	for i, user := range users {
		userResponses[i] = FromEntity(user)
	}
	return userResponses
}
