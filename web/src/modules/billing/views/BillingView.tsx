import React from "react"
import { useBillingData } from "../hooks/useBillingData"
import { SubscriptionCard } from "../components/SubscriptionCard"
import { InvoiceTable } from "../components/InvoiceTable"
import { CreditCard, FileText, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"

export const BillingView: React.FC = () => {
  const { subscriptions, invoices, isLoading } = useBillingData()
  const navigate = useNavigate()

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing &amp; Langganan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola langganan aktif, masa tenggang container, dan riwayat invoice pembayaran.
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/pricing" })} className="font-semibold gap-2">
          <span>Beli Paket Baru</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p>Memuat data billing...</p>
        </div>
      ) : (
        <>
          {/* Subscriptions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5 text-primary" />
              <span>Langganan Container Aktif</span>
            </h2>

            {subscriptions.length === 0 ? (
              <div className="p-6 bg-card ring-1 ring-foreground/10 rounded-xl text-center text-sm text-muted-foreground">
                Belum ada langganan aktif.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {subscriptions.map((sub) => (
                  <SubscriptionCard key={sub.id} subscription={sub} />
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" />
              <span>Riwayat Invoice &amp; Pembayaran</span>
            </h2>

            <InvoiceTable invoices={invoices} />
          </div>
        </>
      )}
    </div>
  )
}
