import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const AdminAuditView: React.FC = () => {
  const { auditLogs, isLoading } = useAdminData()
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
            {t("hosting.adminAudit", "Log Audit Sistem")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Riwayat aksi admin dan pengguna untuk kebutuhan audit trail.
          </p>
        </div>
      </div>

      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{t("hosting.auditAction", "Aksi")}</th>
                <th className="px-4 py-3">{t("hosting.auditEntity", "Entitas")}</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">{t("hosting.date", "Waktu")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs">{t("common.loading", "Memuat log audit...")}</span>
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    Belum ada aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 font-semibold text-xs text-foreground">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {log.entity} {log.entity_id ? `(#${log.entity_id})` : ""}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      #{log.user_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("id-ID")}
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
