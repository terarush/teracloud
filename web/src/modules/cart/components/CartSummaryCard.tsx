import React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, ArrowRight, Loader2, Trash2, Tag, X, CheckCircle2, XCircle } from "lucide-react"
import type { VoucherQuote } from "@/service/api/vouchers"

interface CartSummaryCardProps {
  totalItems: number
  totalAmount: number
  voucherCode?: string
  onVoucherChange?: (code: string) => void
  quote?: VoucherQuote | null
  isValidating?: boolean
  onCheckout: () => void
  onClear: () => void
  isCheckingOut?: boolean
  isClearing?: boolean
}

export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  totalItems,
  totalAmount,
  voucherCode,
  onVoucherChange,
  quote,
  isValidating,
  onCheckout,
  onClear,
  isCheckingOut,
  isClearing,
}) => {
  const { t } = useTranslation()
  const formatIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n)

  const formattedTotal = formatIDR(totalAmount)

  const hasCode = Boolean(voucherCode && voucherCode.trim())

  return (
    <Card className="ring-1 ring-foreground/10 sticky top-20">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h2 className="text-base font-semibold text-foreground">{t("hosting.cartSummary")}</h2>
          {totalItems > 0 && (
            <button
              onClick={onClear}
              disabled={isClearing}
              className="text-xs text-muted-foreground hover:text-destructive transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="size-3" />
              <span>{t("hosting.clearCart")}</span>
            </button>
          )}
        </div>

        {/* Voucher */}
        {onVoucherChange && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Tag className="size-3.5" />
              <span>{t("hosting.voucherCode")}</span>
            </label>
            {onVoucherChange && (
              <div className="relative">
                <Input
                  value={voucherCode}
                  onChange={(e) => onVoucherChange(e.target.value)}
                  placeholder={t("hosting.voucherPlaceholder")}
                  className="h-9 text-xs uppercase pr-8"
                />
                {hasCode && (
                  <button
                    onClick={() => onVoucherChange("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    aria-label={t("hosting.voucherRemoveAria")}
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              {t("hosting.voucherHint")}
            </p>
            {isValidating && (
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>{t("hosting.checkingVoucher")}</span>
              </p>
            )}
            {!isValidating && quote && !quote.valid && (
              <p className="flex items-center gap-1.5 text-[11px] text-destructive">
                <XCircle className="size-3.5" />
                <span>{quote.error_message || t("hosting.voucherInvalid")}</span>
              </p>
            )}
            {!isValidating && quote && quote.valid && (
              <p className="flex items-center gap-1.5 text-[11px] text-primary">
                <CheckCircle2 className="size-3.5" />
                <span>
                  {t("hosting.voucherApplied", { amount: formatIDR(quote.total_discount) })}
                </span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("hosting.totalItems")}</span>
            <span className="font-medium text-foreground">{t("hosting.itemsCount", { count: totalItems })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("hosting.subtotal")}</span>
            <span className="font-medium text-foreground">{formattedTotal}</span>
          </div>
          {quote && quote.valid && (
            <div className="flex justify-between text-primary">
              <span className="text-muted-foreground">{t("hosting.discountVoucher")}</span>
              <span className="font-medium">- {formatIDR(quote.total_discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("hosting.ppn")}</span>
            <span className="font-medium text-foreground">{t("hosting.included")}</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-foreground pt-3 border-t border-border/50">
            <span>{t("hosting.totalPayment")}</span>
            <span className="text-primary">{formatIDR(quote && quote.valid ? quote.total_after : totalAmount)}</span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          disabled={isCheckingOut || totalItems === 0}
          className="w-full text-xs font-semibold gap-1.5 h-9 cursor-pointer"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-1" />
              <span>{t("hosting.processingCheckout")}</span>
            </>
          ) : (
            <>
              <span>{t("hosting.checkoutNow", { count: totalItems })}</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>

        <div className="p-3 bg-primary/5 ring-1 ring-primary/10 rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>{t("hosting.secureCheckoutNote")}</span>
        </div>
      </CardContent>
    </Card>
  )
}
