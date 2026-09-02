// File: modules/vouchers/errs/errors.go
package errs

import "teracloud/internal/pkg/utils"

const (
	CodeVoucherNotFound        = "VOUCHER_NOT_FOUND"
	CodeVoucherInvalid         = "VOUCHER_INVALID"
	CodeVoucherExpired         = "VOUCHER_EXPIRED"
	CodeVoucherCodeExists      = "VOUCHER_CODE_EXISTS"
	CodeVoucherUsageLimit      = "VOUCHER_USAGE_LIMIT"
	CodeVoucherMinAmount       = "VOUCHER_MIN_AMOUNT"
	CodeVoucherPlanNotEligible = "VOUCHER_PLAN_NOT_ELIGIBLE"
	CodeVoucherInvalidID       = "VOUCHER_INVALID_ID"
	CodeVoucherUnauthorized    = "VOUCHER_UNAUTHORIZED"
)

var (
	ErrVoucherNotFound        = utils.NewAppError(CodeVoucherNotFound, "Voucher not found")
	ErrVoucherInvalid         = utils.NewAppError(CodeVoucherInvalid, "Voucher is invalid or inactive")
	ErrVoucherExpired         = utils.NewAppError(CodeVoucherExpired, "Voucher has expired or is not yet active")
	ErrVoucherCodeExists      = utils.NewAppError(CodeVoucherCodeExists, "Voucher code already exists")
	ErrVoucherUsageLimit      = utils.NewAppError(CodeVoucherUsageLimit, "Voucher usage limit reached")
	ErrVoucherMinAmount       = utils.NewAppError(CodeVoucherMinAmount, "Order does not meet the minimum amount for this voucher")
	ErrVoucherPlanNotEligible = utils.NewAppError(CodeVoucherPlanNotEligible, "Voucher does not apply to the selected plan")
	ErrVoucherInvalidID       = utils.NewAppError(CodeVoucherInvalidID, "Invalid voucher ID")
	ErrVoucherUnauthorized    = utils.NewAppError(CodeVoucherUnauthorized, "Unauthorized")
)

var FieldLabels = map[string]string{
	"Code":              "Voucher Code",
	"DiscountType":      "Discount Type",
	"DiscountValue":     "Discount Value",
	"MinOrderAmount":    "Minimum Order Amount",
	"MaxDiscountAmount": "Maximum Discount Amount",
	"AppliesTo":         "Applies To",
	"TotalUsageLimit":   "Total Usage Limit",
	"PerUserUsageLimit": "Per-User Usage Limit",
	"StartAt":           "Start Date",
	"EndAt":             "End Date",
}
