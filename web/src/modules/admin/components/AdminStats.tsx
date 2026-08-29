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

  const items = [
    { icon: DollarSign, value: formattedRevenue, label: "Total Pendapatan", primary: true },
    { icon: Server, value: stats?.active_containers ?? containerCount, label: "Container Aktif" },
    { icon: ShoppingCart, value: stats?.total_orders ?? orderCount, label: "Total Transaksi" },
    { icon: Layers, value: stats?.total_plans ?? planCount, label: "Paket Hosting" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="p-5 bg-card ring-1 ring-foreground/10 rounded-xl flex items-center gap-4"
        >
          <div
            className={`p-3 rounded-lg ${
              item.primary ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-foreground">{item.value}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
