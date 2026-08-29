import React, { useState } from "react"
import type { CartItem } from "@/service/api/cart"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Check, Pencil, Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface CartItemCardProps {
  item: CartItem
  onUpdate: (id: number, payload: { custom_name?: string; duration_months?: number }) => Promise<void>
  onRemove: (id: number) => Promise<void>
  isUpdating?: boolean
  isRemoving?: boolean
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onUpdate,
  onRemove,
  isUpdating,
  isRemoving,
}) => {
  const { t } = useTranslation()
  const [isEditingName, setIsEditingName] = useState(false)
  const [customName, setCustomName] = useState(item.custom_name || "")

  const handleSaveName = async () => {
    await onUpdate(item.id, { custom_name: customName.trim() || undefined })
    setIsEditingName(false)
  }

  const handleDurationChange = async (months: number) => {
    if (months < 1 || months > 36) return
    await onUpdate(item.id, { duration_months: months })
  }

  const plan = item.plan
  const monthlyPrice = item.monthly_price || plan?.price_monthly || 0
  const subtotal = item.subtotal || monthlyPrice * item.duration_months

  const formattedSubtotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(subtotal)

  const formattedMonthly = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(monthlyPrice)

  return (
    <Card className="ring-1 ring-foreground/10 hover:ring-foreground/20 transition-all">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-foreground">
                {plan?.name || `Plan #${item.plan_id}`}
              </h3>
              <Badge className="text-[10px] h-4 px-1.5 border-0 font-medium bg-primary/10 text-primary">
                {item.duration_months} {item.duration_months > 1 ? "Bulan" : "Bulan"}
              </Badge>
            </div>

            {/* Custom Container Name */}
            {isEditingName ? (
              <div className="flex items-center gap-1.5 pt-1">
                <Input
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Nama instance container..."
                  className="h-7 text-xs max-w-xs"
                />
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={handleSaveName}
                  disabled={isUpdating}
                >
                  <Check className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Instance: <strong className="text-foreground font-mono">{item.custom_name || "Auto-generated"}</strong></span>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
                  title="Ubah nama container"
                >
                  <Pencil className="size-3" />
                </button>
              </div>
            )}

            {plan && (
              <p className="text-xs text-muted-foreground font-mono pt-0.5">
                {plan.image_name}:{plan.image_tag} &bull; {plan.cpu_limit} vCPU &bull; {plan.memory_limit} MB &bull; {plan.disk_limit} GB
              </p>
            )}
          </div>

          <div className="text-right sm:self-start">
            <div className="text-sm font-bold text-foreground">{formattedSubtotal}</div>
            <div className="text-[11px] text-muted-foreground">{formattedMonthly} / bln</div>
          </div>
        </div>

        {/* Duration selector & Remove Action */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Durasi:</span>
            <div className="flex items-center gap-1">
              {[1, 3, 6, 12].map((dur) => (
                <button
                  key={dur}
                  onClick={() => handleDurationChange(dur)}
                  disabled={isUpdating}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition cursor-pointer ${
                    item.duration_months === dur
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {dur} Bln
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(item.id)}
            disabled={isRemoving}
            className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1 cursor-pointer"
          >
            {isRemoving ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
            <span>Hapus</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
