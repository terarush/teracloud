import React from "react"
import type { Order } from "@/service/api/orders"
import type { Plan } from "@/service/api/plans"
import { Card } from "@/components/ui/card"
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react"

interface CheckoutSummaryProps {
  plan?: Plan
  order?: Order
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ plan, order }) => {
  const amount = order?.amount || plan?.price_monthly || 0
  const formattedAmount = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount)

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold text-foreground">Ringkasan Pesanan</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {order ? `Order ID: ${order.order_number}` : "Konfirmasi pembelian paket"}
        </p>
      </div>

      {plan && (
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{plan.slug}</p>
            </div>
            <span className="font-extrabold text-lg text-primary">{formattedAmount}</span>
          </div>

          <div className="p-4 bg-muted/50 rounded-2xl space-y-2 text-xs text-muted-foreground">
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
              <span className="font-medium text-foreground">Bulanan (Monthly)</span>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-border pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formattedAmount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">PPN (11%)</span>
          <span className="font-medium">Termasuk</span>
        </div>
        <div className="flex justify-between text-base font-extrabold text-foreground pt-2 border-t border-border/60">
          <span>Total Pembayaran</span>
          <span className="text-primary">{formattedAmount}</span>
        </div>
      </div>

      <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3 text-xs text-muted-foreground">
        <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
        <span>Pembayaran aman terenkripsi melalui Midtrans Snap payment gateway.</span>
      </div>
    </div>
  )
}
