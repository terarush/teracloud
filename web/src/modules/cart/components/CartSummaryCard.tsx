import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight, Loader2, Trash2 } from "lucide-react"

interface CartSummaryCardProps {
  totalItems: number
  totalAmount: number
  onCheckout: () => void
  onClear: () => void
  isCheckingOut?: boolean
  isClearing?: boolean
}

export const CartSummaryCard: React.FC<CartSummaryCardProps> = ({
  totalItems,
  totalAmount,
  onCheckout,
  onClear,
  isCheckingOut,
  isClearing,
}) => {
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(totalAmount)

  return (
    <Card className="ring-1 ring-foreground/10 sticky top-20">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <h2 className="text-base font-semibold text-foreground">Ringkasan Belanja</h2>
          {totalItems > 0 && (
            <button
              onClick={onClear}
              disabled={isClearing}
              className="text-xs text-muted-foreground hover:text-destructive transition flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="size-3" />
              <span>Kosongkan</span>
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Item</span>
            <span className="font-medium text-foreground">{totalItems} Container</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal Tagihan</span>
            <span className="font-medium text-foreground">{formattedTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">PPN (11%)</span>
            <span className="font-medium text-foreground">Termasuk</span>
          </div>

          <div className="flex justify-between text-sm font-bold text-foreground pt-3 border-t border-border/50">
            <span>Total Pembayaran</span>
            <span className="text-primary">{formattedTotal}</span>
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
              <span>Memproses Checkout...</span>
            </>
          ) : (
            <>
              <span>Checkout Sekarang ({totalItems})</span>
              <ArrowRight className="size-3.5" />
            </>
          )}
        </Button>

        <div className="p-3 bg-primary/5 ring-1 ring-primary/10 rounded-lg flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary shrink-0" />
          <span>Transaksi otomatis aman menggunakan Midtrans Snap payment gateway.</span>
        </div>
      </CardContent>
    </Card>
  )
}
