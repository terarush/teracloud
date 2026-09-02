import React from "react"
import { useCheckout } from "../hooks/useCheckout"
import { CheckoutSummary } from "../components/CheckoutSummary"
import { MidtransSnap } from "../components/MidtransSnap"
import { ArrowLeft, Loader2, CheckCircle, ShoppingBag, Tag, CheckCircle2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { useVoucherQuote } from "@/service/hooks/useVoucherQuote"

interface CheckoutViewProps {
  orderId?: number
  planSlug?: string
}

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n)

export const CheckoutView: React.FC<CheckoutViewProps> = ({ orderId, planSlug }) => {
  const { t } = useTranslation()
  const { order, plan, isLoading, handleCreateOrder, isCreating, refetchOrder } = useCheckout(orderId, planSlug)
  const { quote, isValidating, validate } = useVoucherQuote()
  const navigate = useNavigate()
  const [voucherCode, setVoucherCode] = React.useState("")

  // Live voucher validation against the single plan being purchased.
  const quoteItems = plan
    ? [{ plan_id: plan.id, unit_price: plan.price_monthly, duration_months: 1, subtotal: plan.price_monthly }]
    : []

  const handleVoucherChange = (code: string) => {
    setVoucherCode(code)
    validate(code, quoteItems)
  }

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary mb-3" />
        <p className="text-xs">{t("hosting.preparingTransaction", "Menyiapkan transaksi...")}</p>
      </div>
    )
  }

  if (!order && !plan) {
    return (
      <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/app/billing" })}
          className="gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7"
        >
          <ArrowLeft className="size-3.5" />
          <span>{t("hosting.backToBilling", "Kembali ke Billing")}</span>
        </Button>

        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-16 text-center space-y-3">
            <ShoppingBag className="size-12 mx-auto text-muted-foreground/30 mb-2" />
            <h3 className="font-semibold text-base text-foreground">{t("hosting.noActiveOrder", "Tidak Ada Pesanan Aktif")}</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {t("hosting.noActiveOrderDesc", "Tidak ada paket atau pesanan yang dipilih untuk pembayaran. Silakan pilih paket hosting atau buka keranjang belanja.")}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: "/app/cart" as any })}
                className="text-xs font-semibold cursor-pointer"
              >
                {t("hosting.viewCart", "Lihat Keranjang")}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate({ to: "/pricing" })}
                className="text-xs font-semibold cursor-pointer"
              >
                {t("hosting.viewPlans", "Pilih Paket Hosting")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/app/billing" })}
        className="gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7"
      >
        <ArrowLeft className="size-3.5" />
        <span>{t("hosting.backToBilling", "Kembali ke Billing")}</span>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <CheckoutSummary plan={plan} order={order} />

        <Card className="ring-1 ring-foreground/10">
          <CardContent className="p-5 sm:p-6 space-y-5">
            <h2 className="text-base font-semibold text-foreground">{t("hosting.paymentMethod", "Metode Pembayaran")}</h2>

            {order ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-muted/50 rounded-lg text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("hosting.orderIdLabel")}:</span>
                    <span className="font-mono font-medium text-foreground">{order.order_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("hosting.status", "Status")}:</span>
                    <span className="font-bold uppercase text-primary text-[11px]">{order.status}</span>
                  </div>
                </div>

                {order.status === "paid" ? (
                  <div className="p-6 bg-primary/10 ring-1 ring-primary/20 rounded-lg text-center space-y-2.5">
                    <CheckCircle className="size-8 text-primary mx-auto" />
                    <h3 className="font-semibold text-sm text-foreground">{t("hosting.paymentSuccess", "Pembayaran Berhasil!")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("hosting.paymentSuccessDesc", "Container Anda sedang disiapkan dan siap digunakan.")}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => navigate({ to: "/app" })}
                      className="mt-2 text-xs font-semibold cursor-pointer"
                    >
                      {t("hosting.openDetail", "Buka Dashboard")}
                    </Button>
                  </div>
                ) : (
                  <MidtransSnap
                    snapToken={order.snap_token}
                    redirectUrl={order.snap_redirect_url}
                    onSuccess={() => refetchOrder()}
                  />
                )}
              </div>
            ) : plan ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("hosting.checkoutIntro")}
                </p>

                {/* Voucher */}
                <div className="text-left space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Tag className="size-3.5" />
                    <span>{t("hosting.voucherCode")}</span>
                  </label>
                  <Input
                    value={voucherCode}
                    onChange={(e) => handleVoucherChange(e.target.value)}
                    placeholder={t("hosting.voucherPlaceholder")}
                    className="h-9 text-xs uppercase"
                  />
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
                    <>
                      <p className="flex items-center gap-1.5 text-[11px] text-primary">
                        <CheckCircle2 className="size-3.5" />
                        <span>{t("hosting.voucherApplied", { amount: formatIDR(quote.total_discount) })}</span>
                      </p>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted-foreground">{t("hosting.discountVoucher")}</span>
                        <span className="font-medium text-primary">- {formatIDR(quote.total_discount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border/50">
                        <span>{t("hosting.totalPayment")}</span>
                        <span className="text-primary">{formatIDR(quote.total_after)}</span>
                      </div>
                    </>
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {t("hosting.voucherHint")}
                  </p>
                </div>

                <Button
                  onClick={() => handleCreateOrder(plan.id, voucherCode.trim() || undefined)}
                  disabled={isCreating}
                  className="w-full text-xs font-semibold h-9 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      <span>{t("hosting.creatingOrder", "Membuat Order...")}</span>
                    </>
                  ) : (
                    <span>{t("hosting.proceedPayment", "Lanjutkan Pembayaran")}</span>
                  )}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
