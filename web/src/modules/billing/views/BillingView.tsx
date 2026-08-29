import React from "react"
import { useBillingData } from "../hooks/useBillingData"
import { SubscriptionCard } from "../components/SubscriptionCard"
import { InvoiceTable } from "../components/InvoiceTable"
import { CreditCard, FileText, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "@tanstack/react-router"

export const BillingView: React.FC = () => {
  const { subscriptions, invoices, isLoading } = useBillingData()
  const navigate = useNavigate()

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing &amp; Langganan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kelola langganan aktif, masa tenggang container, dan riwayat invoice pembayaran.
          </p>
        </div>
        <Button size="sm" onClick={() => navigate({ to: "/pricing" })} className="font-semibold gap-1.5 text-xs">
          <span>Beli Paket Baru</span>
          <ArrowRight className="size-3.5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          {/* Subscriptions */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <CreditCard className="size-4 text-primary" />
              <span>Langganan Container Aktif</span>
            </h2>

            {subscriptions.length === 0 ? (
              <Card className="ring-1 ring-foreground/10">
                <CardContent className="py-8 text-center text-xs text-muted-foreground">
                  Belum ada langganan aktif.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptions.map((sub) => (
                  <SubscriptionCard key={sub.id} subscription={sub} />
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <FileText className="size-4 text-primary" />
              <span>Riwayat Invoice &amp; Pembayaran</span>
            </h2>

            <InvoiceTable invoices={invoices} />
          </div>
        </>
      )}
    </div>
  )
}
