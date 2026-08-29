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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-primary/10 text-primary rounded-2xl">
          <Server className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-foreground">{totalContainers}</div>
          <div className="text-xs text-muted-foreground">
            {t("hosting.totalContainers", "Total Container")}
          </div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-emerald-500/10 text-emerald-500 rounded-2xl">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-foreground">{runningContainers}</div>
          <div className="text-xs text-muted-foreground">
            {t("hosting.runningContainers", "Container Aktif")}
          </div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-3xl flex items-center space-x-4 shadow-xs">
        <div className="p-3.5 bg-indigo-500/10 text-indigo-500 rounded-2xl">
          <HardDrive className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-foreground">{activeSubscriptions}</div>
          <div className="text-xs text-muted-foreground">
            {t("hosting.activeSubscriptions", "Langganan Aktif")}
          </div>
        </div>
      </div>
    </div>
  )
}
