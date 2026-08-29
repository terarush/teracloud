package request

// LoginRequest represents a request to login a user
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// CreateUserRequest represents a request to create a user
type CreateUserRequest struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name"`
	Username  string `json:"username" validate:"required,min=3,max=50"`
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=6"`
}

// UpdateUserRequest represents a request to update a user
type UpdateUserRequest struct {
	FirstName string `json:"first_name" validate:"required"`
	LastName  string `json:"last_name"`
	Username  string `json:"username" validate:"omitempty,min=3,max=50"`
	Email     string `json:"email" validate:"required,email"`
	Avatar    string `json:"avatar"`
	Password  string `json:"password" validate:"omitempty,min=6"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=6"`
}
