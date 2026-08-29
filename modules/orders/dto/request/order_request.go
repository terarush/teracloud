// File: modules/orders/dto/request/order_request.go
package request

type CreateOrderRequest struct {
	PlanID uint `json:"plan_id" validate:"required"`
}
