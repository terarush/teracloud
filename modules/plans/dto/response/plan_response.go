// File: modules/plans/dto/response/plan_response.go
package response

import (
	"encoding/json"
	"time"

	"ruang-tukar/modules/plans/domain/entity"
)

type PlanResponse struct {
	ID                  uint            `json:"id"`
	Name                string          `json:"name"`
	Slug                string          `json:"slug"`
	Description         string          `json:"description"`
	ShortDescription    string          `json:"short_description"`
	ImageName           string          `json:"image_name"`
	ImageTag            string          `json:"image_tag"`
	ThumbnailURL        *string         `json:"thumbnail_url"`
	Category            string          `json:"category"`
	Badge               *string         `json:"badge"`
	IsFeatured          bool            `json:"is_featured"`
	StockLimit          *int            `json:"stock_limit"`
	CPULimit            float64         `json:"cpu_limit"`
	MemoryLimit         int             `json:"memory_limit"`
	DiskLimit           int             `json:"disk_limit"`
	BandwidthLimit      *int            `json:"bandwidth_limit"`
	PriceMonthly        int64           `json:"price_monthly"`
	IsActive            bool            `json:"is_active"`
	SortOrder           int             `json:"sort_order"`
	Features            json.RawMessage `json:"features"`
	PortConfig          json.RawMessage `json:"port_config"`
	EnvironmentTemplate json.RawMessage `json:"environment_template"`
	Command             *string         `json:"command,omitempty"`
	Entrypoint          *string         `json:"entrypoint,omitempty"`
	Icon                string          `json:"icon"`
	MaxPerUser          int             `json:"max_per_user"`
	CreatedAt           time.Time       `json:"created_at"`
	UpdatedAt           time.Time       `json:"updated_at"`
}

func FromEntity(plan *entity.Plan) *PlanResponse {
	return &PlanResponse{
		ID:                  plan.ID,
		Name:                plan.Name,
		Slug:                plan.Slug,
		Description:         plan.Description,
		ShortDescription:    plan.ShortDescription,
		ImageName:           plan.ImageName,
		ImageTag:            plan.ImageTag,
		ThumbnailURL:        plan.ThumbnailURL,
		Category:            plan.Category,
		Badge:               plan.Badge,
		IsFeatured:          plan.IsFeatured,
		StockLimit:          plan.StockLimit,
		CPULimit:            plan.CPULimit,
		MemoryLimit:         plan.MemoryLimit,
		DiskLimit:           plan.DiskLimit,
		BandwidthLimit:      plan.BandwidthLimit,
		PriceMonthly:        plan.PriceMonthly,
		IsActive:            plan.IsActive,
		SortOrder:           plan.SortOrder,
		Features:            plan.Features,
		PortConfig:          plan.PortConfig,
		EnvironmentTemplate: plan.EnvironmentTemplate,
		Command:             plan.Command,
		Entrypoint:          plan.Entrypoint,
		Icon:                plan.Icon,
		MaxPerUser:          plan.MaxPerUser,
		CreatedAt:           plan.CreatedAt,
		UpdatedAt:           plan.UpdatedAt,
	}
}

func FromEntities(plans []*entity.Plan) []*PlanResponse {
	responses := make([]*PlanResponse, len(plans))
	for i, plan := range plans {
		responses[i] = FromEntity(plan)
	}
	return responses
}
