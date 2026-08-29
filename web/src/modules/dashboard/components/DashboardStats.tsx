import React from "react"
import { Server, Cpu, HardDrive } from "lucide-react"
import { useTranslation } from "react-i18next"

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
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="p-5 bg-card ring-1 ring-foreground/10 rounded-xl flex items-center gap-4"
        >
          <div className="p-3 bg-muted text-muted-foreground rounded-lg">
            <stat.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
