import React from "react"
import type { Subscription } from "@/service/api/billing"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { Calendar, RefreshCw } from "lucide-react"

interface SubscriptionCardProps {
  subscription: Subscription
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ subscription }) => {
  return (
    <div className="p-6 bg-card ring-1 ring-foreground/10 rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-foreground">Subscription #{subscription.id}</h3>
          <div className="text-xs text-muted-foreground mt-0.5">
            Container ID: {subscription.container_id || "Sedang disiapkan"}
          </div>
        </div>
        <StatusBadge status={subscription.status} />
      </div>

      <div className="space-y-2 text-xs text-muted-foreground pt-3 border-t border-border">
        <div className="flex justify-between">
          <span>Mulai Periode:</span>
          <span className="font-medium text-foreground">
            {new Date(subscription.period_start).toLocaleDateString("id-ID")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Berakhir Pada:</span>
          <span className="font-medium text-foreground">
            {new Date(subscription.period_end).toLocaleDateString("id-ID")}
          </span>
        </div>
        {subscription.grace_period_end && (
          <div className="flex justify-between text-destructive font-medium">
            <span>Batas Grace Period:</span>
            <span>{new Date(subscription.grace_period_end).toLocaleDateString("id-ID")}</span>
          </div>
        )}
      </div>
    </div>
  )
}
