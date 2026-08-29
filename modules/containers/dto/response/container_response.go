// File: modules/containers/dto/response/container_response.go
package response

import (
	"encoding/json"
	"time"

	"ruang-tukar/modules/containers/domain/entity"
)

type ContainerResponse struct {
	ID            uint            `json:"id"`
	UserID        uint            `json:"user_id"`
	SubscriptionID uint           `json:"subscription_id"`
	PlanID        uint            `json:"plan_id"`
	ContainerName string          `json:"container_name"`
	Hostname      string          `json:"hostname"`
	ImageName     string          `json:"image_name"`
	ImageTag      string          `json:"image_tag"`
	Status        string          `json:"status"`
	CPULimit      float64         `json:"cpu_limit"`
	MemoryLimit   int             `json:"memory_limit"`
	DiskLimit     int             `json:"disk_limit"`
	PortMappings  json.RawMessage `json:"port_mappings,omitempty"`
	AssignedPorts json.RawMessage `json:"assigned_ports,omitempty"`
	TunnelRoutes  json.RawMessage `json:"tunnel_routes,omitempty"`
	LastStartedAt *time.Time      `json:"last_started_at,omitempty"`
	LastStoppedAt *time.Time      `json:"last_stopped_at,omitempty"`
	ErrorMessage  string          `json:"error_message,omitempty"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
}

func FromEntity(c *entity.Container) *ContainerResponse {
	return &ContainerResponse{
		ID:            c.ID,
		UserID:        c.UserID,
		SubscriptionID: c.SubscriptionID,
		PlanID:        c.PlanID,
		ContainerName: c.ContainerName,
		Hostname:      c.Hostname,
		ImageName:     c.ImageName,
		ImageTag:      c.ImageTag,
		Status:        c.Status,
		CPULimit:      c.CPULimit,
		MemoryLimit:   c.MemoryLimit,
		DiskLimit:     c.DiskLimit,
		PortMappings:  c.PortMappings,
		AssignedPorts: c.AssignedPorts,
		TunnelRoutes:  c.TunnelRoutes,
		LastStartedAt: c.LastStartedAt,
		LastStoppedAt: c.LastStoppedAt,
		ErrorMessage:  c.ErrorMessage,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
	}
}

func FromEntities(containers []*entity.Container) []*ContainerResponse {
	responses := make([]*ContainerResponse, len(containers))
	for i, c := range containers {
		responses[i] = FromEntity(c)
	}
	return responses
}
