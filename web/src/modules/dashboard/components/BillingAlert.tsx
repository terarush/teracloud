import React from "react"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import type { Subscription } from "@/service/api/billing"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"

interface BillingAlertProps {
  subscriptions: Subscription[]
}

export const BillingAlert: React.FC<BillingAlertProps> = ({ subscriptions }) => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const expiring = subscriptions.filter(
    (s) => s.status === "grace_period" || s.status === "suspended"
  )

  if (expiring.length === 0) return null

  return (
    <Card className="bg-destructive/10 border-0 ring-1 ring-destructive/20">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-destructive">
        <div className="flex items-center gap-3">
          <AlertTriangle className="size-4 shrink-0" />
          <span className="font-medium text-xs sm:text-sm">
            {t("hosting.billingAlert", {
              count: expiring.length,
              defaultValue: `Anda memiliki ${expiring.length} langganan dalam masa tenggang (grace period) atau ditangguhkan.`,
            })}
          </span>
        </div>
        <button
          onClick={() => navigate({ to: "/app/billing" })}
          className="text-xs font-semibold underline flex items-center gap-1 hover:opacity-80 transition cursor-pointer shrink-0"
        >
          <span>{t("hosting.manageBilling", "Kelola Billing")}</span>
          <ArrowRight className="size-3.5" />
        </button>
      </CardContent>
    </Card>
  )
}
