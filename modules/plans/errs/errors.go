// File: modules/plans/errs/errors.go
package errs

import "teracloud/internal/pkg/utils"

const (
	CodePlanNotFound     = "PLAN_NOT_FOUND"
	CodePlanInactive     = "PLAN_INACTIVE"
	CodePlanSlugExists   = "PLAN_SLUG_EXISTS"
	CodePlanLimitReached = "PLAN_LIMIT_REACHED"
	CodePlanInvalidID     = "PLAN_INVALID_ID"
)

var (
	ErrPlanNotFound     = utils.NewAppError(CodePlanNotFound, "Plan not found")
	ErrPlanInactive     = utils.NewAppError(CodePlanInactive, "Plan is not active")
	ErrPlanSlugExists   = utils.NewAppError(CodePlanSlugExists, "Plan with this name already exists")
	ErrPlanLimitReached = utils.NewAppError(CodePlanLimitReached, "Maximum containers for this plan reached")
	ErrPlanInvalidID     = utils.NewAppError(CodePlanInvalidID, "Invalid plan ID")
)

var FieldLabels = map[string]string{
	"Name":             "Name",
	"ImageName":        "Image Name",
	"ImageTag":         "Image Tag",
	"CPULimit":         "CPU Limit",
	"MemoryLimit":      "Memory Limit",
	"DiskLimit":        "Disk Limit",
	"PriceMonthly":     "Monthly Price",
	"ShortDescription": "Short Description",
}
