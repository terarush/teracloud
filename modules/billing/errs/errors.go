// File: modules/billing/errs/errors.go
package errs

import "teracloud/internal/pkg/utils"

const (
	CodeSubscriptionNotFound = "SUBSCRIPTION_NOT_FOUND"
	CodeSubscriptionExpired  = "SUBSCRIPTION_EXPIRED"
	CodeInvoiceNotFound      = "INVOICE_NOT_FOUND"
	CodeInvoiceInvalidID     = "INVOICE_INVALID_ID"
	CodeSubInvalidID         = "SUBSCRIPTION_INVALID_ID"
	CodeBillingForbidden     = "BILLING_FORBIDDEN"
	CodeBillingUnauthorized  = "BILLING_UNAUTHORIZED"
)

var (
	ErrSubscriptionNotFound = utils.NewAppError(CodeSubscriptionNotFound, "Subscription not found")
	ErrSubscriptionExpired  = utils.NewAppError(CodeSubscriptionExpired, "Subscription has expired")
	ErrInvoiceNotFound      = utils.NewAppError(CodeInvoiceNotFound, "Invoice not found")
	ErrInvoiceInvalidID     = utils.NewAppError(CodeInvoiceInvalidID, "Invalid invoice ID")
	ErrSubInvalidID         = utils.NewAppError(CodeSubInvalidID, "Invalid subscription ID")
	ErrBillingForbidden     = utils.NewAppError(CodeBillingForbidden, "Unauthorized")
	ErrBillingUnauthorized  = utils.NewAppError(CodeBillingUnauthorized, "Unauthorized")
)
