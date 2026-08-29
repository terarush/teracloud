import React from "react"
import { Server, Cpu, HardDrive, AlertTriangle } from "lucide-react"

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4 shadow-xs">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Server className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-foreground">{totalContainers}</div>
          <div className="text-xs text-muted-foreground">Total Container</div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4 shadow-xs">
        <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-foreground">{runningContainers}</div>
          <div className="text-xs text-muted-foreground">Container Aktif (Running)</div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4 shadow-xs">
        <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
          <HardDrive className="w-6 h-6" />
        </div>
        <div>
          <div className="text-2xl font-extrabold text-foreground">{activeSubscriptions}</div>
          <div className="text-xs text-muted-foreground">Langganan Aktif</div>
        </div>
      </div>
    </div>
  )
}
