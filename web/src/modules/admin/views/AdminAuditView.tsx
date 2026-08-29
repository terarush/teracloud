import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const AdminAuditView: React.FC = () => {
  const { auditLogs, isLoading } = useAdminData()
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
            {t("hosting.adminAudit", "Log Audit Sistem")}
          </h1>
        </div>
      </div>

      <div className="bg-card ring-1 ring-foreground/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4">{t("hosting.auditAction", "Aksi")}</th>
                <th className="px-6 py-4">{t("hosting.auditEntity", "Entitas")}</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">{t("hosting.date", "Waktu")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    {t("common.loading", "Memuat log audit...")}
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Belum ada aktivitas yang tercatat.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-primary">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-xs text-foreground">
                      {log.entity} <span className="text-muted-foreground">#{log.entity_id}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {log.user_id ? `#${log.user_id}` : "system"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                      {log.ip_address || "-"}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString("id-ID")}
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
