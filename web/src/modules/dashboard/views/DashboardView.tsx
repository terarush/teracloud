import React from "react"
import { useDashboard } from "../hooks/useDashboard"
import { DashboardStats } from "../components/DashboardStats"
import { BillingAlert } from "../components/BillingAlert"
import { useNavigate } from "@tanstack/react-router"
import { Server, Plus, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"

export const DashboardView: React.FC = () => {
  const { containers, subscriptions, runningContainers, isLoading } = useDashboard()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("hosting.dashboard", "Console Dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("hosting.dashboardDesc", "Ringkasan alokasi container aktif, status resource, dan informasi langganan.")}
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/pricing" })}
          className="flex items-center gap-2 font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t("hosting.newContainer", "Deploy Container Baru")}</span>
        </Button>
      </div>

      <BillingAlert subscriptions={subscriptions} />

      <DashboardStats
        totalContainers={containers.length}
        runningContainers={runningContainers}
        activeSubscriptions={subscriptions.length}
      />

      {/* Containers List Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">
            {t("hosting.yourContainers", "Container Docker Anda")}
          </h2>
          {containers.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/app/containers" })}
              className="text-xs cursor-pointer"
            >
              {t("hosting.viewAll", "Lihat Semua")}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p>{t("hosting.loadingContainers", "Memuat daftar container...")}</p>
          </div>
        ) : containers.length === 0 ? (
          <div className="p-12 text-center bg-card ring-1 ring-foreground/10 rounded-xl space-y-4">
            <div className="p-4 bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Server className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-lg font-bold text-foreground">
              {t("hosting.noContainersTitle", "Belum Ada Container Aktif")}
            </div>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {t("hosting.noContainersDesc", "Anda belum memiliki instance container. Pilih salah satu paket hosting untuk mulai deploy.")}
            </p>
            <Button onClick={() => navigate({ to: "/pricing" })} className="font-semibold cursor-pointer">
              {t("hosting.viewPlans", "Pilih Paket Hosting")}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {containers.map((container) => (
              <div
                key={container.id}
                className="p-6 bg-card ring-1 ring-foreground/10 rounded-xl flex flex-col justify-between space-y-5 hover:ring-primary/40 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-foreground truncate">
                      {container.container_name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wide ${
                        container.status === "running"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {container.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {container.image_name}:{container.image_tag}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <span>{container.cpu_limit} vCPU</span>
                    <span>&bull;</span>
                    <span>{container.memory_limit} MB RAM</span>
                    <span>&bull;</span>
                    <span>{container.disk_limit} GB NVMe</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold cursor-pointer"
                  onClick={() =>
                    navigate({
                      to: "/app/containers/$id",
                      params: { id: String(container.id) },
                    })
                  }
                >
                  <span>{t("hosting.openDetail", "Buka Detail & Terminal")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
