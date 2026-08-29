import React from "react"
import { AlertTriangle, ArrowRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import type { Subscription } from "@/service/api/billing"

interface BillingAlertProps {
  subscriptions: Subscription[]
}

export const BillingAlert: React.FC<BillingAlertProps> = ({ subscriptions }) => {
  const navigate = useNavigate()
  const expiring = subscriptions.filter(
    (s) => s.status === "grace_period" || s.status === "suspended"
  )

  if (expiring.length === 0) return null

  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm text-amber-500">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span>
          Anda memiliki <strong>{expiring.length}</strong> langganan yang dalam masa tenggang (grace period) atau ditangguhkan.
        </span>
      </div>
      <button
        onClick={() => navigate({ to: "/app/billing" })}
        className="font-semibold underline flex items-center gap-1 hover:text-amber-400 transition"
      >
        <span>Kelola Billing</span>
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}
