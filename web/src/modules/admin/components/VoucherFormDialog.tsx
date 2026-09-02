import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Voucher, CreateVoucherRequest } from "@/service/api/vouchers"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface VoucherFormDialogProps {
  initialVoucher?: Voucher | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateVoucherRequest) => Promise<void>
  isPending: boolean
}

export const VoucherFormDialog: React.FC<VoucherFormDialogProps> = ({
  initialVoucher,
  isOpen,
  onClose,
  onSubmit,
  isPending,
}) => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CreateVoucherRequest>({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: null,
    applies_to: "all",
    total_usage_limit: null,
    per_user_usage_limit: null,
    start_at: null,
    end_at: null,
    is_active: true,
    plan_ids: [],
  })

  useEffect(() => {
    if (initialVoucher) {
      setFormData({
        code: initialVoucher.code || "",
        name: initialVoucher.name || "",
        description: initialVoucher.description || "",
        discount_type: initialVoucher.discount_type,
        discount_value: initialVoucher.discount_value,
        min_order_amount: initialVoucher.min_order_amount || 0,
        max_discount_amount: initialVoucher.max_discount_amount ?? null,
        applies_to: initialVoucher.applies_to,
        total_usage_limit: initialVoucher.total_usage_limit ?? null,
        per_user_usage_limit: initialVoucher.per_user_usage_limit ?? null,
        start_at: initialVoucher.start_at || null,
        end_at: initialVoucher.end_at || null,
        is_active: initialVoucher.is_active,
        plan_ids: initialVoucher.plans?.map((p) => p.id) || [],
      })
    } else {
      setFormData({
        code: "",
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_amount: 0,
        max_discount_amount: null,
        applies_to: "all",
        total_usage_limit: null,
        per_user_usage_limit: null,
        start_at: null,
        end_at: null,
        is_active: true,
        plan_ids: [],
      })
    }
  }, [initialVoucher, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onClose()
  }

  const toDatetimeLocal = (iso: string | null | undefined): string => {
    if (!iso) return ""
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const fromDatetimeLocal = (val: string): string | null => {
    return val ? new Date(val).toISOString() : null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} size="lg">
      <DialogContent showFullscreenButton={false} showCloseButton={true}>
        <DialogHeader>
          <DialogTitle>
            {initialVoucher ? t("hosting.voucher.editTitle") : t("hosting.voucher.addTitle")}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-5 text-sm py-2">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t("hosting.voucher.basicInfo")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.codeLabel")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("hosting.voucher.codePlaceholder")}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.nameLabel")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("hosting.voucher.namePlaceholder")}
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={2}
                  placeholder={t("hosting.voucher.descPlaceholder")}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Discount Config */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t("hosting.voucher.discountSection")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.typeLabel")} <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(val: any) => setFormData({ ...formData, discount_type: val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-background border-border">
                      <SelectValue placeholder={t("hosting.voucher.typePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="percentage">{t("hosting.voucher.typePercent")}</SelectItem>
                      <SelectItem value="fixed_amount">{t("hosting.voucher.typeFixed")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.valueLabel")} <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discount_type === "percentage" ? t("hosting.voucher.valuePlaceholderPct") : t("hosting.voucher.valuePlaceholderFixed")}
                    value={formData.discount_value || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.maxDiscountLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={t("hosting.voucher.noLimit")}
                    value={formData.max_discount_amount ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_discount_amount: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.minOrderLabel")}
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder={t("hosting.voucher.minOrderPlaceholder")}
                    value={formData.min_order_amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_amount: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.appliesTo")}
                  </label>
                  <Select
                    value={formData.applies_to || "all"}
                    onValueChange={(val: any) => setFormData({ ...formData, applies_to: val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-background border-border">
                      <SelectValue placeholder={t("hosting.voucher.appliesToPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="all">{t("hosting.voucher.allPlans")}</SelectItem>
                      <SelectItem value="specific_plans">{t("hosting.voucher.specificPlans")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t("hosting.voucher.usageSection")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.totalUsageLabel")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={t("hosting.voucher.noLimit")}
                    value={formData.total_usage_limit ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_usage_limit: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.perUserUsageLabel")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={t("hosting.voucher.noLimit")}
                    value={formData.per_user_usage_limit ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        per_user_usage_limit: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                {t("hosting.voucher.scheduleSection")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.startsOn")}
                  </label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(formData.start_at)}
                    onChange={(e) =>
                      setFormData({ ...formData, start_at: fromDatetimeLocal(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    {t("hosting.voucher.endsOn")}
                  </label>
                  <input
                    type="datetime-local"
                    value={toDatetimeLocal(formData.end_at)}
                    onChange={(e) =>
                      setFormData({ ...formData, end_at: fromDatetimeLocal(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="pt-3 border-t border-border/50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="size-4 rounded border-border accent-primary"
                />
                <span className="text-xs font-semibold text-muted-foreground">{t("hosting.voucher.activeBadge")}</span>
              </label>
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            form="voucher-form"
            disabled={isPending}
            className="font-semibold cursor-pointer"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {initialVoucher ? t("hosting.voucher.saveChanges") : t("hosting.voucher.createBtn")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
