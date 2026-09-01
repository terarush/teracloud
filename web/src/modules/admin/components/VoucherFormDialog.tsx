import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import type { Voucher, CreateVoucherRequest } from "@/service/api/vouchers"
import { Loader2 } from "lucide-react"
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
            {initialVoucher ? "Edit Voucher" : "Tambah Voucher Baru"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody>
          <form id="voucher-form" onSubmit={handleSubmit} className="space-y-5 text-sm py-2">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Informasi Dasar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Kode Voucher <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DISKON20"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Nama Voucher
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Diskon Spesial"
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
                  placeholder="Deskripsi voucher (opsional)"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>

            {/* Discount Config */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Konfigurasi Diskon
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Tipe Diskon <span className="text-destructive">*</span>
                  </label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(val: any) => setFormData({ ...formData, discount_type: val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-background border-border">
                      <SelectValue placeholder="Pilih tipe" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="percentage">Persen (%)</SelectItem>
                      <SelectItem value="fixed_amount">Nominal (IDR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Nilai Diskon <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discount_type === "percentage" ? "e.g. 20" : "e.g. 50000"}
                    value={formData.discount_value || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Maks. Diskon (IDR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Tanpa batas"
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
                    Min. Order (IDR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.min_order_amount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_amount: e.target.value === "" ? 0 : Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Berlaku Untuk
                  </label>
                  <Select
                    value={formData.applies_to || "all"}
                    onValueChange={(val: any) => setFormData({ ...formData, applies_to: val })}
                  >
                    <SelectTrigger className="w-full h-10 bg-background border-border">
                      <SelectValue placeholder="Semua paket" />
                    </SelectTrigger>
                    <SelectContent className="z-[10000]">
                      <SelectItem value="all">Semua Paket</SelectItem>
                      <SelectItem value="specific_plans">Paket Tertentu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Usage Limits */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Batasan Penggunaan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Limit Total Penggunaan
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Tanpa batas"
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
                    Limit Per Pengguna
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Tanpa batas"
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
                Jadwal Aktif
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Mulai Aktif
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
                    Berakhir
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
                <span className="text-xs font-semibold text-muted-foreground">Aktif</span>
              </label>
            </div>
          </form>
        </DialogBody>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} className="cursor-pointer">
            Batal
          </Button>
          <Button
            type="submit"
            form="voucher-form"
            disabled={isPending}
            className="font-semibold cursor-pointer"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {initialVoucher ? "Simpan Perubahan" : "Buat Voucher"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
