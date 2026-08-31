import React from "react"
import { useCheckout } from "../hooks/useCheckout"
import { CheckoutSummary } from "../components/CheckoutSummary"
import { MidtransSnap } from "../components/MidtransSnap"
import { ArrowLeft, Loader2, CheckCircle, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

interface CheckoutViewProps {
  orderId?: number
  planSlug?: string
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ orderId, planSlug }) => {
  const { t } = useTranslation()
  const { order, plan, isLoading, handleCreateOrder, isCreating } = useCheckout(orderId, planSlug)
  const navigate = useNavigate()

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
                    <span className="text-muted-foreground">Order ID:</span>
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
                    token={order.snap_token}
                    redirectUrl={order.snap_redirect_url}
                    orderNumber={order.order_number}
                  />
                )}
              </div>
            ) : plan ? (
              <div className="space-y-4 text-center py-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Klik tombol di bawah ini untuk membuat tagihan resmi dan membuka pop-up pembayaran Midtrans Snap.
                </p>
                <Button
                  onClick={() => handleCreateOrder(plan.id)}
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
