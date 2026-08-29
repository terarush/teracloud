package entity

import (
	"time"
)

// User represents a user entity in Teracloud
type User struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	FirstName    string     `json:"first_name" gorm:"type:varchar(100)"`
	LastName     string     `json:"last_name" gorm:"type:varchar(100)"`
	Username     string     `json:"username" gorm:"type:varchar(50);uniqueIndex"`
	Email        string     `json:"email" gorm:"type:varchar(255);uniqueIndex"`
	Role         string     `json:"role" gorm:"type:varchar(20);default:user"`
	Avatar       string     `json:"avatar" gorm:"type:text"`
	AuthProvider string     `json:"auth_provider" gorm:"type:varchar(20);default:local"`
	GoogleID     string     `json:"google_id" gorm:"index;type:varchar(100)"`
	Password     string     `json:"-" gorm:"type:varchar(255)"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// TableName specifies the table name for User
func (*User) TableName() string {
	return "users"
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
