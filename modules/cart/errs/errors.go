// File: modules/cart/errs/errors.go
package errs

import "ruang-tukar/internal/pkg/utils"

const CodeCartInvalidItemID = "CART_INVALID_ITEM_ID"

var (
	ErrCartItemNotFound   = utils.NewAppError(utils.CodeNotFound, "Cart item not found")
	ErrInvalidDuration    = utils.NewAppError(utils.CodeValidation, "Duration must be at least 1 month")
	ErrPlanNotActive      = utils.NewAppError(utils.CodeValidation, "Selected plan is currently inactive or out of stock")
	ErrCartEmpty          = utils.NewAppError(utils.CodeBadRequest, "Your cart is empty")
	ErrCartInvalidItemID  = utils.NewAppError(CodeCartInvalidItemID, "Invalid cart item ID")
)

var FieldLabels = map[string]string{
	"PlanID":         "Plan ID",
	"DurationMonths": "Duration (Months)",
	"CustomName":     "Container Name",
}
