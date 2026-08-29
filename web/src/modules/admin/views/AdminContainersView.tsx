import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const AdminContainersView: React.FC = () => {
  const { containers, isLoading } = useAdminData()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
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
            {t("hosting.adminContainers", "Semua Container")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Daftar seluruh container milik semua pengguna platform.
          </p>
        </div>
      </div>

      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{t("hosting.containerName", "Nama Container")}</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">{t("hosting.dockerImage", "Image Docker")}</th>
                <th className="px-4 py-3">{t("hosting.resourceAllocation", "Resource")}</th>
                <th className="px-4 py-3">{t("hosting.status", "Status")}</th>
                <th className="px-4 py-3">{t("hosting.date", "Dibuat")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs">{t("common.loading", "Memuat daftar container...")}</span>
                  </td>
                </tr>
              ) : containers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    Belum ada container yang tercatat.
                  </td>
                </tr>
              ) : (
                containers.map((container) => (
                  <tr key={container.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 font-semibold text-xs text-foreground">
                      {container.container_name}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      #{container.user_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {container.image_name}:{container.image_tag}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {container.cpu_limit} vCPU &bull; {container.memory_limit} MB RAM &bull; {container.disk_limit} GB
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={container.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(container.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
