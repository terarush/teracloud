import React from "react"
import { useCheckout } from "../hooks/useCheckout"
import { CheckoutSummary } from "../components/CheckoutSummary"
import { MidtransSnap } from "../components/MidtransSnap"
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"

interface CheckoutViewProps {
  orderId?: number
  planSlug?: string
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ orderId, planSlug }) => {
  const { order, plan, isLoading, handleCreateOrder, isCreating } = useCheckout(orderId, planSlug)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p>Menyiapkan transaksi...</p>
      </div>
    )
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/app/billing" })}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali</span>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <CheckoutSummary plan={plan} order={order} />

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-xl font-bold text-foreground">Metode Pembayaran</h2>

          {order ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/40 rounded-2xl text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nomor Order:</span>
                  <span className="font-mono font-medium">{order.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold uppercase text-primary">{order.status}</span>
                </div>
              </div>

              {order.status === "paid" ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h3 className="font-bold text-emerald-500">Pembayaran Berhasil!</h3>
                  <p className="text-xs text-muted-foreground">
                    Container Docker Anda sedang dipersiapkan dan siap diakses.
                  </p>
                  <Button onClick={() => navigate({ to: "/app" })} className="w-full">
                    Buka Dashboard Container
                  </Button>
                </div>
              ) : (
                <MidtransSnap
                  snapToken={order.snap_token}
                  redirectUrl={order.snap_redirect_url}
                  onSuccess={() => navigate({ to: "/app" })}
                />
              )}
            </div>
          ) : plan ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Klik tombol di bawah untuk mengonfirmasi order dan melanjutkan ke pembayaran otomatis Midtrans.
              </p>
              <Button
                size="lg"
                disabled={isCreating}
                onClick={() => handleCreateOrder(plan.id)}
                className="w-full font-bold"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Lanjut ke Pembayaran
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada item pesanan yang dipilih.</p>
          )}
        </div>
      </div>
    </div>
  )
}
