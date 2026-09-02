import React from "react"
import type { Subscription } from "@/service/api/billing"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Server, ExternalLink, Calendar, RefreshCw } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

interface SubscriptionTableProps {
  subscriptions: Subscription[]
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ subscriptions }) => {
  const { t } = useTranslation()

  if (subscriptions.length === 0) {
    return (
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="py-10 text-center">
          <Server className="size-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            {t("hosting.billing.noSubscriptions", "Belum ada langganan aktif.")}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate days remaining helper
  const getRemainingInfo = (sub: Subscription) => {
    const now = new Date().getTime()
    const end = new Date(sub.period_end).getTime()
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24))

    if (sub.status === "grace_period" && sub.grace_period_end) {
      const graceEnd = new Date(sub.grace_period_end).getTime()
      const graceDiff = Math.ceil((graceEnd - now) / (1000 * 60 * 60 * 24))
      return {
        text: graceDiff > 0 
          ? t("hosting.billing.graceDays", "Grace: {{days}} hari lagi", { days: graceDiff })
          : t("hosting.billing.expired", "Kedaluwarsa"),
        variant: "destructive" as const,
        isGrace: true,
      }
    }

    if (diffDays < 0) {
      return {
        text: t("hosting.billing.expired", "Kedaluwarsa"),
        variant: "destructive" as const,
        isGrace: false,
      }
    }

    if (diffDays === 0) {
      return {
        text: t("hosting.billing.todayExpires", "Berakhir hari ini"),
        variant: "warning" as const,
        isGrace: false,
      }
    }

    return {
      text: t("hosting.billing.remainingDays", "{{days}} hari lagi", { days: diffDays }),
      variant: diffDays <= 3 ? ("warning" as const) : ("default" as const),
      isGrace: false,
    }
  }

  return (
    <Card className="ring-1 ring-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">{t("hosting.billing.subscription", "Langganan")}</th>
              <th className="px-4 py-3">{t("hosting.billing.container", "Container")}</th>
              <th className="px-4 py-3">{t("hosting.billing.period", "Periode & Sisa Waktu")}</th>
              <th className="px-4 py-3">{t("hosting.status", "Status")}</th>
              <th className="px-4 py-3 text-right">{t("hosting.actions", "Aksi")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {subscriptions.map((sub) => {
              const remaining = getRemainingInfo(sub)

              return (
                <tr key={sub.id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3.5">
                    <div className="font-semibold text-xs text-foreground">
                      #{sub.id}
                    </div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <RefreshCw className="size-3" />
                      <span>
                        {sub.auto_renew
                          ? t("hosting.billing.autoRenewOn", "Auto-renew Aktif")
                          : t("hosting.billing.autoRenewOff", "Auto-renew Nonaktif")}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {sub.container_id ? (
                      <Link
                        to="/containers/$id"
                        params={{ id: String(sub.container_id) }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Server className="size-3.5" />
                        <span>Container #{sub.container_id}</span>
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        {t("hosting.containerPreparePending", "Sedang disiapkan")}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="text-xs text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground" />
                      <span>
                        {new Date(sub.period_start).toLocaleDateString("id-ID")} &mdash;{" "}
                        {new Date(sub.period_end).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <div className="mt-1">
                      <Badge
                        variant={
                          remaining.variant === "destructive"
                            ? "destructive"
                            : remaining.variant === "warning"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px] h-4 px-1.5 font-normal"
                      >
                        {remaining.text}
                      </Badge>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <StatusBadge status={sub.status} />
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {sub.container_id ? (
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs gap-1 px-2">
                        <Link to="/containers/$id" params={{ id: String(sub.container_id) }}>
                          <span>{t("hosting.billing.openContainer", "Buka")}</span>
                          <ExternalLink className="size-3" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
