import React from "react"
import { useCartQuery } from "@/service/query/cart"
import {
  useUpdateCartMutation,
  useRemoveCartMutation,
  useClearCartMutation,
  useCheckoutCartMutation,
} from "@/service/mutation/cart"
import { CartItemCard } from "../components/CartItemCard"
import { CartSummaryCard } from "../components/CartSummaryCard"
import { useVoucherQuote } from "@/service/hooks/useVoucherQuote"
import type { VoucherQuoteItem } from "@/service/api/vouchers"
import { ShoppingCart, ArrowLeft, Loader2, PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

export const CartView: React.FC = () => {
  const { data: cart, isLoading } = useCartQuery()
  const { quote, isValidating, validate } = useVoucherQuote()
  const updateMutation = useUpdateCartMutation()
  const removeMutation = useRemoveCartMutation()
  const clearMutation = useClearCartMutation()
  const checkoutMutation = useCheckoutCartMutation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [voucherCode, setVoucherCode] = React.useState("")

  const quoteItems: VoucherQuoteItem[] = (cart?.items || []).map((item) => ({
    plan_id: item.plan_id,
    unit_price: item.monthly_price,
    duration_months: item.duration_months,
    subtotal: item.subtotal,
  }))

  const handleVoucherChange = (code: string) => {
    setVoucherCode(code)
    validate(code, quoteItems)
  }

  const handleUpdateItem = async (
    id: number,
    payload: { custom_name?: string; duration_months?: number }
  ) => {
    try {
      await updateMutation.mutateAsync({ id, payload })
      toast.success("Keranjang diperbarui")
    } catch (err: any) {
      toast.error(err?.message || "Gagal memperbarui item")
    }
  }

  const handleRemoveItem = async (id: number) => {
    try {
      await removeMutation.mutateAsync(id)
      toast.success("Item dihapus dari keranjang")
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus item")
    }
  }

  const handleClearCart = async () => {
    if (!window.confirm("Apakah Anda yakin ingin mengosongkan keranjang belanja?")) return
    try {
      await clearMutation.mutateAsync()
      toast.success("Keranjang berhasil dikosongkan")
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengosongkan keranjang")
    }
  }

  const handleCheckout = async () => {
    try {
      const order = await checkoutMutation.mutateAsync({
        voucherCode: voucherCode.trim() || undefined,
      })
      toast.success("Order berhasil dibuat!")
      navigate({
        to: "/orders/checkout/$orderId",
        params: { orderId: String(order.id) },
      })
    } catch (err: any) {
      toast.error(err?.message || "Gagal memproses checkout")
    }
  }

  const items = cart?.items || []
  const totalItems = cart?.total_items || items.length
  const totalAmount = cart?.total_amount || 0

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/app" })}
            className="gap-1 mb-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Dashboard</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Keranjang Belanja
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daftar paket hosting yang siap untuk dicheckout dan dideploy.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/pricing" })}
          className="gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <PackagePlus className="size-3.5" />
          <span>Tambah Paket Lain</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : items.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-16 text-center space-y-3">
            <ShoppingCart className="size-12 mx-auto text-muted-foreground/30 mb-2" />
            <h3 className="font-semibold text-base text-foreground">Keranjang Belanja Anda Kosong</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Belum ada paket container yang dipilih. Silakan pilih paket hosting untuk mulai memesan.
            </p>
            <Button
              size="sm"
              onClick={() => navigate({ to: "/pricing" })}
              className="mt-2 text-xs font-semibold cursor-pointer"
            >
              Lihat Pilihan Paket Hosting
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Item List */}
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                onUpdate={handleUpdateItem}
                onRemove={handleRemoveItem}
                isUpdating={updateMutation.isPending}
                isRemoving={removeMutation.isPending}
              />
            ))}
          </div>

          {/* Summary Sidebar */}
          <div>
            <CartSummaryCard
              totalItems={totalItems}
              totalAmount={totalAmount}
              voucherCode={voucherCode}
              onVoucherChange={handleVoucherChange}
              quote={quote}
              isValidating={isValidating}
              onCheckout={handleCheckout}
              onClear={handleClearCart}
              isCheckingOut={checkoutMutation.isPending}
              isClearing={clearMutation.isPending}
            />
          </div>
        </div>
      )}
    </div>
  )
}
