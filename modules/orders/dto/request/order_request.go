// File: modules/orders/dto/request/order_request.go
package request

type CreateOrderRequest struct {
	PlanID         uint   `json:"plan_id" validate:"required"`
	CustomName     string `json:"custom_name"`
	DurationMonths int    `json:"duration_months" validate:"omitempty,min=1,max=36"`
	VoucherCode    string `json:"voucher_code"`
}

type CheckoutCartRequest struct {
	CartItemIDs []uint `json:"cart_item_ids"` // if empty, checkout all user's cart items
	VoucherCode string `json:"voucher_code"`
}

type DirectCheckoutItem struct {
	PlanID            uint   `json:"plan_id" validate:"required"`
	CustomName        string `json:"custom_name"`
	DurationMonths    int    `json:"duration_months" validate:"required,min=1,max=36"`
	EnvironmentConfig string `json:"environment_config"`
}

type DirectCheckoutRequest struct {
	Items []DirectCheckoutItem `json:"items" validate:"required,min=1,dive"`
}
