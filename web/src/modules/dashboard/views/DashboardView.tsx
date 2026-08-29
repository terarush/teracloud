import React from "react"
import { useDashboard } from "../hooks/useDashboard"
import { DashboardStats } from "../components/DashboardStats"
import { BillingAlert } from "../components/BillingAlert"
import { useNavigate } from "@tanstack/react-router"
import { Server, Plus, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslation } from "react-i18next"

export const DashboardView: React.FC = () => {
  const { containers, subscriptions, runningContainers, isLoading } = useDashboard()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("hosting.dashboard", "Console Dashboard")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("hosting.dashboardDesc", "Ringkasan alokasi container aktif, status resource, dan informasi langganan.")}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate({ to: "/pricing" })}
          className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <Plus className="size-3.5" />
          <span>{t("hosting.newContainer", "Deploy Container")}</span>
        </Button>
      </div>

      <BillingAlert subscriptions={subscriptions} />

      <DashboardStats
        totalContainers={containers.length}
        runningContainers={runningContainers}
        activeSubscriptions={subscriptions.length}
      />

      {/* Containers List Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {t("hosting.yourContainers", "Container Docker Anda")}
          </h2>
          {containers.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate({ to: "/app/containers" })}
              className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {t("hosting.viewAll", "Lihat Semua")}
              <ArrowRight className="size-3" />
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        ) : containers.length === 0 ? (
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="py-12 text-center space-y-3">
              <Server className="size-10 mx-auto text-muted-foreground/30 mb-2" />
              <div className="text-base font-semibold text-foreground">
                {t("hosting.noContainersTitle", "Belum Ada Container Aktif")}
              </div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {t("hosting.noContainersDesc", "Anda belum memiliki instance container. Pilih salah satu paket hosting untuk mulai deploy.")}
              </p>
              <Button size="sm" onClick={() => navigate({ to: "/pricing" })} className="font-semibold cursor-pointer">
                {t("hosting.viewPlans", "Pilih Paket Hosting")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((container) => (
              <Card
                key={container.id}
                className="ring-1 ring-foreground/10 hover:ring-foreground/20 transition-all flex flex-col justify-between"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {container.container_name}
                      </h3>
                      <Badge
                        className={`text-[10px] h-4 px-1.5 border-0 font-medium ${
                          container.status === "running"
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {container.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {container.image_name}:{container.image_tag}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-0.5">
                      <span>{container.cpu_limit} vCPU</span>
                      <span>&bull;</span>
                      <span>{container.memory_limit} MB RAM</span>
                      <span>&bull;</span>
                      <span>{container.disk_limit} GB</span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer h-8"
                    onClick={() =>
                      navigate({
                        to: "/app/containers/$id",
                        params: { id: String(container.id) },
                      })
                    }
                  >
                    <span>{t("hosting.openDetail", "Detail & Terminal")}</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
