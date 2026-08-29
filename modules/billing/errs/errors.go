// File: modules/billing/errs/errors.go
package errs

import "ruang-tukar/internal/pkg/utils"

const (
	CodeSubscriptionNotFound = "SUBSCRIPTION_NOT_FOUND"
	CodeSubscriptionExpired  = "SUBSCRIPTION_EXPIRED"
	CodeInvoiceNotFound      = "INVOICE_NOT_FOUND"
)

var (
	ErrSubscriptionNotFound = utils.NewAppError(CodeSubscriptionNotFound, "Subscription not found")
	ErrSubscriptionExpired  = utils.NewAppError(CodeSubscriptionExpired, "Subscription has expired")
	ErrInvoiceNotFound      = utils.NewAppError(CodeInvoiceNotFound, "Invoice not found")
)
