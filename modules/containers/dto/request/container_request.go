// File: modules/containers/dto/request/container_request.go
package request

type ResetContainerRequest struct {
	Mode string `json:"mode" validate:"required,oneof=soft hard"`
}
