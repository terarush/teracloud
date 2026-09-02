import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useAdminVouchersQuery } from "@/service/query/vouchers"
import {
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useToggleVoucherMutation,
} from "@/service/mutation/vouchers"
import { VoucherFormDialog } from "../components/VoucherFormDialog"
import { Plus, Edit, Trash2, ArrowLeft, Loader2, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "@tanstack/react-router"
import type { Voucher, CreateVoucherRequest } from "@/service/api/vouchers"
import { toast } from "sonner"

export const AdminVouchersView: React.FC = () => {
  const { t } = useTranslation()
  const { data: vouchers = [], isLoading } = useAdminVouchersQuery()
  const createMutation = useCreateVoucherMutation()
  const updateMutation = useUpdateVoucherMutation()
  const deleteMutation = useDeleteVoucherMutation()
  const toggleMutation = useToggleVoucherMutation()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const navigate = useNavigate()

  const isMutating = createMutation.isPending || updateMutation.isPending

  const handleCreate = async (data: CreateVoucherRequest) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success(t("hosting.voucher.toastCreated"))
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("hosting.voucher.toastCreateFailed"))
    }
  }

  const handleUpdate = async (data: CreateVoucherRequest) => {
    if (!selectedVoucher) return
    try {
      await updateMutation.mutateAsync({ id: selectedVoucher.id, data })
      toast.success(t("hosting.voucher.toastUpdated"))
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("hosting.voucher.toastUpdateFailed"))
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(t("hosting.voucher.confirmDelete"))) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success(t("hosting.voucher.toastDeleted"))
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("hosting.voucher.toastDeleteFailed"))
    }
  }

  const handleToggle = async (id: number) => {
    try {
      await toggleMutation.mutateAsync(id)
      toast.success(t("hosting.voucher.toastToggled"))
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("hosting.voucher.toastToggleFailed"))
    }
  }

  const formatDiscount = (v: Voucher) => {
    if (v.discount_type === "percentage") return `${v.discount_value}%`
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v.discount_value)
  }

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n)

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/app/console" })}
            className="gap-1 mb-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t("hosting.voucher.backToConsole")}</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("hosting.voucher.management")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("hosting.voucher.managementDesc")}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedVoucher(null)
            setIsDialogOpen(true)
          }}
          className="gap-1.5 font-semibold text-xs cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>{t("hosting.voucher.addBtn")}</span>
        </Button>
      </div>

      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{t("hosting.voucher.codeLabel")}</th>
                <th className="px-4 py-3">{t("hosting.voucher.nameLabel")}</th>
                <th className="px-4 py-3">{t("hosting.voucher.colDiscount")}</th>
                <th className="px-4 py-3">{t("hosting.voucher.minOrderLabel")}</th>
                <th className="px-4 py-3">{t("hosting.voucher.colLimit")}</th>
                <th className="px-4 py-3">{t("hosting.status")}</th>
                <th className="px-4 py-3 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs">{t("hosting.voucher.loading")}</span>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    <Ticket className="size-8 mx-auto mb-2 opacity-30" />
                    <span>{t("hosting.voucher.emptyRows")}</span>
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded">
                        {v.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground">
                      <div>{v.name || "—"}</div>
                      {v.description && (
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                          {v.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">
                      {formatDiscount(v)}
                      {v.max_discount_amount && v.discount_type === "percentage" && (
                        <div className="text-[11px] font-normal text-muted-foreground">
                          {t("hosting.voucher.maxPrefix")} {formatCurrency(v.max_discount_amount)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {v.min_order_amount > 0 ? formatCurrency(v.min_order_amount) : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div>{v.total_usage_limit ? `${t("hosting.voucher.totalPrefix")} ${v.total_usage_limit}` : t("hosting.voucher.noLimit")}</div>
                      {v.per_user_usage_limit && (
                        <div className="text-[11px]">{t("hosting.voucher.perUserPrefix")} {v.per_user_usage_limit}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggle(v.id)}
                        className="cursor-pointer inline-flex items-center"
                      >
                        <Badge
                          className={`text-[10px] h-4 px-1.5 border-0 font-medium ${
                            v.is_active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {v.is_active ? t("hosting.voucher.activeBadge") : t("hosting.voucher.inactiveBadge")}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedVoucher(v)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(v.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <VoucherFormDialog
        initialVoucher={selectedVoucher}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(data) => {
          if (selectedVoucher) return handleUpdate(data)
          return handleCreate(data)
        }}
        isPending={isMutating}
      />
    </div>
  )
}
