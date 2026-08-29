import React, { useState } from "react"
import { useAdminData } from "../hooks/useAdminData"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { ArrowLeft, Loader2, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { adminApi } from "@/service/api/admin"
import { useQueryClient } from "@tanstack/react-query"

export const AdminContainersView: React.FC = () => {
  const { containers, isLoading } = useAdminData()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [actionType, setActionType] = useState<"restart" | "delete" | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  const handleRestart = async (id: number) => {
    setLoadingId(id)
    setActionType("restart")
    try {
      await adminApi.adminRestartContainer(id)
      await queryClient.invalidateQueries({ queryKey: ["admin"] })
    } catch (err) {
      console.error("Restart failed:", err)
    } finally {
      setLoadingId(null)
      setActionType(null)
    }
  }

  const handleDelete = async (id: number) => {
    setLoadingId(id)
    setActionType("delete")
    try {
      await adminApi.forceDeleteContainer(id)
      await queryClient.invalidateQueries({ queryKey: ["admin"] })
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setLoadingId(null)
      setActionType(null)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-6">
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
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs">{t("common.loading", "Memuat daftar container...")}</span>
                  </td>
                </tr>
              ) : containers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-muted-foreground">
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
                      {container.cpu_limit} vCPU &bull; {container.memory_limit} MB &bull; {container.disk_limit} GB
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={container.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(container.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer"
                          disabled={loadingId === container.id}
                          onClick={() => handleRestart(container.id)}
                          title="Restart container"
                        >
                          {loadingId === container.id && actionType === "restart" ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <RotateCcw className="size-3" />
                          )}
                          Restart
                        </Button>

                        {confirmDeleteId === container.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2.5 text-[11px] cursor-pointer"
                              disabled={loadingId === container.id}
                              onClick={() => handleDelete(container.id)}
                            >
                              {loadingId === container.id && actionType === "delete" ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                "Yakin?"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px] cursor-pointer"
                              onClick={() => setConfirmDeleteId(null)}
                            >
                              Batal
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-[11px] gap-1 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setConfirmDeleteId(container.id)}
                            title="Hapus container"
                          >
                            <Trash2 className="size-3" />
                            Hapus
                          </Button>
                        )}
                      </div>
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

