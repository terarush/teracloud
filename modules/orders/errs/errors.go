// File: modules/orders/errs/errors.go
package errs

import "ruang-tukar/internal/pkg/utils"

const (
	CodeOrderNotFound            = "ORDER_NOT_FOUND"
	CodeOrderAlreadyPaid         = "ORDER_ALREADY_PAID"
	CodeOrderExpired             = "ORDER_EXPIRED"
	CodePaymentVerificationFail  = "PAYMENT_VERIFICATION_FAILED"
	CodeInvalidWebhookSignature  = "INVALID_WEBHOOK_SIGNATURE"
	CodePlanLimitReached         = "PLAN_LIMIT_REACHED"
)

var (
	ErrOrderNotFound            = utils.NewAppError(CodeOrderNotFound, "Order not found")
	ErrOrderAlreadyPaid         = utils.NewAppError(CodeOrderAlreadyPaid, "Order is already paid")
	ErrOrderExpired             = utils.NewAppError(CodeOrderExpired, "Order has expired")
	ErrPaymentVerificationFail  = utils.NewAppError(CodePaymentVerificationFail, "Payment verification failed")
	ErrInvalidWebhookSignature  = utils.NewAppError(CodeInvalidWebhookSignature, "Invalid webhook signature")
	ErrPlanLimitReached         = utils.NewAppError(CodePlanLimitReached, "You have reached the maximum active containers allowed for this plan")
)

var FieldLabels = map[string]string{
	"PlanID":        "Plan ID",
	"BillingPeriod": "Billing Period",
}
