import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const AdminContainersView: React.FC = () => {
  const { containers, isLoading } = useAdminData()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/app/console" })}
            className="gap-2 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("common.back", "Kembali ke Console")}</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("hosting.adminContainers", "Semua Container")}
          </h1>
        </div>
      </div>

      <div className="bg-card ring-1 ring-foreground/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4">{t("hosting.containerName", "Nama Container")}</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">{t("hosting.dockerImage", "Image Docker")}</th>
                <th className="px-6 py-4">{t("hosting.resourceAllocation", "Resource")}</th>
                <th className="px-6 py-4">{t("hosting.status", "Status")}</th>
                <th className="px-6 py-4">{t("hosting.date", "Dibuat")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    {t("common.loading", "Memuat daftar container...")}
                  </td>
                </tr>
              ) : containers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada container yang tercatat.
                  </td>
                </tr>
              ) : (
                containers.map((container) => (
                  <tr key={container.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4 font-bold text-foreground">
                      {container.container_name}
                      <div className="text-xs text-muted-foreground font-mono font-normal">
                        {container.hostname}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      #{container.user_id}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                      {container.image_name}:{container.image_tag}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {container.cpu_limit} vCPU &bull; {container.memory_limit} MB &bull; {container.disk_limit} GB
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={container.status} />
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(container.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
