// File: modules/plans/dto/request/plan_request.go
package request

import "encoding/json"

type CreatePlanRequest struct {
	Name                string          `json:"name" validate:"required,max=100"`
	Description         string          `json:"description"`
	ShortDescription    string          `json:"short_description" validate:"max=255"`
	ImageName           string          `json:"image_name" validate:"required"`
	ImageTag            string          `json:"image_tag" validate:"required"`
	ThumbnailURL        *string         `json:"thumbnail_url"`
	Category            string          `json:"category"`
	Badge               *string         `json:"badge"`
	IsFeatured          bool            `json:"is_featured"`
	StockLimit          *int            `json:"stock_limit"`
	CPULimit            float64         `json:"cpu_limit" validate:"required"`
	MemoryLimit         int             `json:"memory_limit" validate:"required"`
	DiskLimit           int             `json:"disk_limit" validate:"required"`
	BandwidthLimit      *int            `json:"bandwidth_limit"`
	PriceMonthly        int64           `json:"price_monthly" validate:"required"`
	Features            json.RawMessage `json:"features"`
	EnvironmentTemplate json.RawMessage `json:"environment_template"`
	Icon                string          `json:"icon"`
	MaxPerUser          int             `json:"max_per_user"`
	SortOrder           int             `json:"sort_order"`
}

type UpdatePlanRequest struct {
	Name                string          `json:"name" validate:"required,max=100"`
	Description         string          `json:"description"`
	ShortDescription    string          `json:"short_description" validate:"max=255"`
	ImageName           string          `json:"image_name" validate:"required"`
	ImageTag            string          `json:"image_tag" validate:"required"`
	ThumbnailURL        *string         `json:"thumbnail_url"`
	Category            string          `json:"category"`
	Badge               *string         `json:"badge"`
	IsFeatured          bool            `json:"is_featured"`
	StockLimit          *int            `json:"stock_limit"`
	CPULimit            float64         `json:"cpu_limit" validate:"required"`
	MemoryLimit         int             `json:"memory_limit" validate:"required"`
	DiskLimit           int             `json:"disk_limit" validate:"required"`
	BandwidthLimit      *int            `json:"bandwidth_limit"`
	PriceMonthly        int64           `json:"price_monthly" validate:"required"`
	IsActive            bool            `json:"is_active"`
	Features            json.RawMessage `json:"features"`
	EnvironmentTemplate json.RawMessage `json:"environment_template"`
	Icon                string          `json:"icon"`
	MaxPerUser          int             `json:"max_per_user"`
	SortOrder           int             `json:"sort_order"`
}
