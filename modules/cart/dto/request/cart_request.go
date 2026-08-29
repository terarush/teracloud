// File: modules/cart/dto/request/cart_request.go
package request

import "encoding/json"

type AddToCartRequest struct {
	PlanID            uint            `json:"plan_id" validate:"required"`
	CustomName        string          `json:"custom_name" validate:"max=100"`
	DurationMonths    int             `json:"duration_months" validate:"required,min=1,max=36"`
	EnvironmentConfig json.RawMessage `json:"environment_config"`
}

type UpdateCartItemRequest struct {
	CustomName        *string          `json:"custom_name"`
	DurationMonths    *int             `json:"duration_months" validate:"omitempty,min=1,max=36"`
	EnvironmentConfig *json.RawMessage `json:"environment_config"`
}
