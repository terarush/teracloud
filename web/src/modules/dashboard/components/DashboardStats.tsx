import React from "react"
import { Server, Cpu, HardDrive } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardStatsProps {
  totalContainers: number
  runningContainers: number
  activeSubscriptions: number
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalContainers,
  runningContainers,
  activeSubscriptions,
}) => {
  const { t } = useTranslation()

  const stats = [
    {
      icon: Server,
      value: totalContainers,
      label: t("hosting.totalContainers", "Total Container"),
    },
    {
      icon: Cpu,
      value: runningContainers,
      label: t("hosting.runningContainers", "Container Aktif"),
    },
    {
      icon: HardDrive,
      value: activeSubscriptions,
      label: t("hosting.activeSubscriptions", "Langganan Aktif"),
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="ring-1 ring-foreground/10">
            <CardContent className="py-4 px-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Icon className="size-4" />
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
