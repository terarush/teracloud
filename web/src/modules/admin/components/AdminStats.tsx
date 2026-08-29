import React from "react"
import { DollarSign, Server, ShoppingCart, Layers } from "lucide-react"
import type { AdminStats as AdminStatsType } from "@/service/api/admin"
import { Card, CardContent } from "@/components/ui/card"

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
    { icon: DollarSign, value: formattedRevenue, label: "Total Pendapatan" },
    { icon: Server, value: stats?.active_containers ?? containerCount, label: "Container Aktif" },
    { icon: ShoppingCart, value: stats?.total_orders ?? orderCount, label: "Total Transaksi" },
    { icon: Layers, value: stats?.total_plans ?? planCount, label: "Paket Hosting" },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon
        return (
          <Card key={idx} className="ring-1 ring-foreground/10">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="size-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground truncate">{item.value}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
