import React, { useState } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { PlanFormDialog } from "../components/PlanFormDialog"
import { Plus, Edit, Trash2, CheckCircle, XCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useNavigate } from "@tanstack/react-router"
import type { Plan } from "@/service/api/plans"
import { useTranslation } from "react-i18next"
import { getImageUrl } from "@/lib/utils"

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
            <span>{t("common.back", "Kembali ke Console")}</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("hosting.adminPlans", "Manajemen Paket Hosting")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Konfigurasi spesifikasi dan paket container hosting.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setSelectedPlan(null)
            setIsDialogOpen(true)
          }}
          className="gap-1.5 font-semibold text-xs cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>{t("hosting.addPlan", "Tambah Paket Baru")}</span>
        </Button>
      </div>

      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{t("hosting.planName", "Nama Paket")}</th>
                <th className="px-4 py-3">{t("hosting.dockerImage", "Image Docker")}</th>
                <th className="px-4 py-3">{t("hosting.resourceAllocation", "Resource Alokasi")}</th>
                <th className="px-4 py-3">{t("hosting.pricePerMonth", "Harga / Bulan")}</th>
                <th className="px-4 py-3">{t("hosting.status", "Status")}</th>
                <th className="px-4 py-3 text-right">{t("hosting.actions", "Aksi")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs">{t("common.loading", "Memuat daftar paket...")}</span>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    Belum ada paket hosting yang dibuat.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr key={plan.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 font-semibold text-xs text-foreground">
                      <div className="flex items-center gap-3">
                        {plan.icon ? (
                          <img
                            src={getImageUrl(plan.icon)}
                            alt={plan.name}
                            className="size-8 rounded-lg object-contain border border-border bg-muted/30 p-0.5 shrink-0"
                          />
                        ) : (
                          <div className="size-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                            {plan.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            <span>{plan.name}</span>
                            {plan.badge && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-semibold">
                                {plan.badge}
                              </span>
                            )}
                            {plan.thumbnail_url && (
                              <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-normal">
                                +Banner
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono font-normal">
                            {plan.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      <div>{plan.image_name}:{plan.image_tag}</div>
                      {plan.port_config && plan.port_config.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 font-sans">
                          {plan.port_config.map((p, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-secondary/80 text-secondary-foreground px-1.5 py-0.5 rounded font-mono"
                            >
                              :{p.container_port} ({p.name || p.protocol || "tcp"})
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {plan.cpu_limit} vCPU &bull; {plan.memory_limit} MB RAM &bull; {plan.disk_limit} GB
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(plan.price_monthly)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePlan(plan.id)}
                        className="cursor-pointer inline-flex items-center"
                      >
                        <Badge
                          className={`text-[10px] h-4 px-1.5 border-0 font-medium ${
                            plan.is_active
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {plan.is_active ? t("hosting.active", "Aktif") : t("hosting.inactive", "Nonaktif")}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeletePlan(plan.id)}
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
