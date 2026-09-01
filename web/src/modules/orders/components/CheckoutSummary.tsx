import React from "react"
import type { Order } from "@/service/api/orders"
import type { Plan } from "@/service/api/plans"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"
import { useTranslation } from "react-i18next"

interface CheckoutSummaryProps {
  plan?: Plan
  order?: Order
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ plan, order }) => {
  const { t } = useTranslation()
  const amount = order?.amount || plan?.price_monthly || 0
  const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n)
  const formattedAmount = fmt(amount)

  const discount = order?.discount_amount || 0
  const subtotal = discount > 0 ? (order?.total_amount || amount) + discount : amount

  return (
    <Card className="ring-1 ring-foreground/10">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="border-b border-border/50 pb-3">
          <h2 className="text-base font-semibold text-foreground">{t("hosting.orderSummary", "Ringkasan Pesanan")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {order ? `Order ID: ${order.order_number}` : "Konfirmasi pembelian paket"}
          </p>
        </div>

        {plan && (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-sm text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground font-mono">{plan.slug}</p>
              </div>
              <span className="font-bold text-sm text-foreground">{formattedAmount}</span>
            </div>

            <div className="p-3.5 bg-muted/50 rounded-lg space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Alokasi CPU:</span>
                <span className="font-medium text-foreground">{plan.cpu_limit} vCPU</span>
              </div>
              <div className="flex justify-between">
                <span>Alokasi RAM:</span>
                <span className="font-medium text-foreground">{plan.memory_limit} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Storage NVMe:</span>
                <span className="font-medium text-foreground">{plan.disk_limit} GB</span>
              </div>
              <div className="flex justify-between">
                <span>Billing Cycle:</span>
                <span className="font-medium text-foreground">Bulanan ({t("hosting.monthly", "bulan")})</span>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-border/50 pt-3 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium text-foreground">{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                Diskon
                {order?.voucher_code && (
                  <span className="font-mono text-[10px] uppercase text-primary px-1 py-0.5 rounded bg-primary/10">
                    {order.voucher_code}
                  </span>
                )}
              </span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">-{formattedAmount}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">PPN (11%)</span>
            <span className="font-medium text-foreground">Termasuk</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-foreground pt-2 border-t border-border/50">
            <span>{t("hosting.total", "Total Tagihan")}</span>
            <span className="text-primary">{formattedAmount}</span>
          </div>
        </div>

        <div className="p-3 bg-primary/5 ring-1 ring-primary/10 rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>Pembayaran aman terenkripsi melalui Midtrans Snap.</span>
        </div>
      </CardContent>
    </Card>
  )
}
