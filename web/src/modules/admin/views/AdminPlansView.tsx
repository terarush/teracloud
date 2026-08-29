import React, { useState } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { PlanFormDialog } from "../components/PlanFormDialog"
import { Plus, Edit, Trash2, CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import type { Plan } from "@/service/api/plans"
import { useTranslation } from "react-i18next"

export const AdminPlansView: React.FC = () => {
  const {
    plans,
    isLoading,
    handleCreatePlan,
    handleUpdatePlan,
    handleDeletePlan,
    handleTogglePlan,
    isPlanMutating,
  } = useAdminData()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/app/admin" })}
            className="gap-2 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("common.back", "Kembali ke Admin Console")}</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("hosting.adminPlans", "Manajemen Paket Hosting")}
          </h1>
        </div>

        <Button
          onClick={() => {
            setSelectedPlan(null)
            setIsDialogOpen(true)
          }}
          className="gap-2 font-semibold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("hosting.addPlan", "Tambah Paket Baru")}</span>
        </Button>
      </div>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4">{t("hosting.planName", "Nama Paket")}</th>
                <th className="px-6 py-4">{t("hosting.dockerImage", "Image Docker")}</th>
                <th className="px-6 py-4">{t("hosting.resourceAllocation", "Resource Alokasi")}</th>
                <th className="px-6 py-4">{t("hosting.pricePerMonth", "Harga / Bulan")}</th>
                <th className="px-6 py-4">{t("hosting.status", "Status")}</th>
                <th className="px-6 py-4 text-right">{t("hosting.actions", "Aksi")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    {t("common.loading", "Memuat daftar paket...")}
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada paket hosting yang dibuat.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4 font-bold text-foreground">
                      {plan.name}
                      <div className="text-xs text-muted-foreground font-mono font-normal">
                        {plan.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {plan.image_name}:{plan.image_tag}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {plan.cpu_limit} vCPU &bull; {plan.memory_limit} MB RAM &bull; {plan.disk_limit} GB
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(plan.price_monthly)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePlan(plan.id)}
                        className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold"
                      >
                        {plan.is_active ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>{t("hosting.active", "Aktif")}</span>
                          </span>
                        ) : (
                          <span className="text-rose-500 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            <span>{t("hosting.inactive", "Nonaktif")}</span>
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlan(plan.id)}
                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PlanFormDialog
        initialPlan={selectedPlan}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(data) => {
          if (selectedPlan) {
            return handleUpdatePlan(selectedPlan.id, data)
          }
          return handleCreatePlan(data)
        }}
        isPending={isPlanMutating}
      />
    </div>
  )
}
