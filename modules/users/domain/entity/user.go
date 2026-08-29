package entity

import (
	"time"
)

// UserProfileLink represents custom links/social links associated with a user profile
type UserProfileLink struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Title     string    `gorm:"type:varchar(100);not null" json:"title"`
	URL       string    `gorm:"type:varchar(255);not null" json:"url"`
	Icon      string    `gorm:"type:varchar(50)" json:"icon"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// TableName specifies the table name for UserProfileLink
func (*UserProfileLink) TableName() string {
	return "user_profile_links"
}

// UserSocialMedia stores social media account handles
type UserSocialMedia struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Platform  string    `gorm:"type:varchar(50);not null" json:"platform"` // instagram, youtube, twitter/x, tiktok, linkedin, github
	Handle    string    `gorm:"type:varchar(100);not null" json:"handle"`
	URL       string    `gorm:"type:varchar(255)" json:"url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (*UserSocialMedia) TableName() string {
	return "user_social_medias"
}

// UserBadge stores achievements or verified badges for creator
type UserBadge struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"` // Top Seller, Verified Creator, Early Supporter
	Icon        string    `gorm:"type:varchar(100)" json:"icon"`
	Description string    `gorm:"type:varchar(255)" json:"description"`
	Color       string    `gorm:"type:varchar(30)" json:"color"`
	CreatedAt   time.Time `json:"created_at"`
}

func (*UserBadge) TableName() string {
	return "user_badges"
}

// UserCustomSection allows creators to add pinned text/FAQS/featured content sections to their profile
type UserCustomSection struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"not null;index" json:"user_id"`
	Title     string    `gorm:"type:varchar(150);not null" json:"title"`
	Content   string    `gorm:"type:text;not null" json:"content"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (*UserCustomSection) TableName() string {
	return "user_custom_sections"
}

// User represents a user entity
type User struct {
	ID           uint                `gorm:"primaryKey" json:"id"`
	FirstName    string              `json:"first_name"`
	LastName     string              `json:"last_name"`
	Username     string              `json:"username" gorm:"type:varchar(50)"`
	Email        string              `json:"email"`
	Role         string              `json:"role" gorm:"type:varchar(20);default:user"`
	Avatar       string              `json:"avatar"`
	Banner       string              `json:"banner"`
	Bio          string              `json:"bio" gorm:"type:text"`
	Location     string              `json:"location" gorm:"type:varchar(100)"`
	Website      string              `json:"website" gorm:"type:varchar(255)"`
	VerifiedAt   *time.Time          `json:"verified_at,omitempty"`
	AuthProvider string              `json:"auth_provider" gorm:"type:varchar(20);default:local"`
	GoogleID     string              `json:"google_id" gorm:"uniqueIndex;type:varchar(100)"`
	Password     string              `json:"-"`
	Links        []UserProfileLink   `json:"links,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Socials      []UserSocialMedia   `json:"socials,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Badges       []UserBadge         `json:"badges,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	Sections     []UserCustomSection `json:"sections,omitempty" gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"`
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`
}

// TableName specifies the table name for User
func (*User) TableName() string {
	return "users"
}

// MaxProfileLinks defines the maximum allowed custom links per user profile (max 5)
const MaxProfileLinks = 5

// CanAddMoreLinks checks if user has reached the maximum 5 links limit
func (u *User) CanAddMoreLinks() bool {
	return len(u.Links) < MaxProfileLinks
}

// FullName returns the full display name.
func (u *User) FullName() string {
	if u.LastName == "" {
		return u.FirstName
	}
	return u.FirstName + " " + u.LastName
}

// NewUser creates a new user
func NewUser(firstName, lastName, username, email, password string) *User {
	now := time.Now()
	return &User{
		FirstName: firstName,
		LastName:  lastName,
		Username:  username,
		Email:     email,
		Password:  password,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewGoogleUser creates a new user from Google OAuth
func NewGoogleUser(firstName, lastName, email, googleID, avatar string) *User {
	now := time.Now()
	return &User{
		FirstName:    firstName,
		LastName:     lastName,
		Email:        email,
		AuthProvider: "google",
		GoogleID:     googleID,
		Avatar:       avatar,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
}
