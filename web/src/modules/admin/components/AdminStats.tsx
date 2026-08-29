import React from "react"
import { DollarSign, Server, ShoppingCart, Layers } from "lucide-react"
import type { AdminStats as AdminStatsType } from "@/service/api/admin"

interface AdminStatsProps {
  stats?: AdminStatsType
  planCount: number
  containerCount: number
  orderCount: number
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  stats,
  planCount,
  containerCount,
  orderCount,
}) => {
  const formattedRevenue = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(stats?.total_revenue || 0)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xl font-bold text-foreground">{formattedRevenue}</div>
          <div className="text-xs text-muted-foreground">Total Pendapatan</div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
          <Server className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xl font-bold text-foreground">
            {stats?.active_containers ?? containerCount}
          </div>
          <div className="text-xs text-muted-foreground">Container Aktif</div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
          <ShoppingCart className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xl font-bold text-foreground">
            {stats?.total_orders ?? orderCount}
          </div>
          <div className="text-xs text-muted-foreground">Total Transaksi</div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-amber-500/10 text-amber-500 rounded-2xl">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xl font-bold text-foreground">
            {stats?.total_plans ?? planCount}
          </div>
          <div className="text-xs text-muted-foreground">Paket Hosting</div>
        </div>
      </div>
    </div>
  )
}
