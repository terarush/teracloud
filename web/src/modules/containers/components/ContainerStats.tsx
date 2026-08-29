import React from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { ContainerStats as ContainerStatsType } from "@/service/api/containers"

interface ContainerStatsProps {
  stats: ContainerStatsType[]
  memoryLimitMb: number
}

export const ContainerStats: React.FC<ContainerStatsProps> = ({ stats, memoryLimitMb }) => {
  const chartData = stats.slice(-20).map((s) => ({
    time: new Date(s.recorded_at).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    cpu: s.cpu_usage_percent || 0,
    memory: s.memory_usage_mb || 0,
  }))

  const latest = stats[stats.length - 1]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-card border border-border rounded-2xl">
          <div className="text-xs text-muted-foreground">CPU Usage (Current)</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {latest?.cpu_usage_percent?.toFixed(1) || 0}%
          </div>
        </div>
        <div className="p-5 bg-card border border-border rounded-2xl">
          <div className="text-xs text-muted-foreground">RAM Usage (Current)</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {latest?.memory_usage_mb || 0} MB / {memoryLimitMb} MB
          </div>
        </div>
        <div className="p-5 bg-card border border-border rounded-2xl">
          <div className="text-xs text-muted-foreground">Network I/O (Total)</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {((latest?.network_rx_bytes || 0) / (1024 * 1024)).toFixed(2)} MB
          </div>
        </div>
      </div>

      <div className="p-6 bg-card border border-border rounded-2xl space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Grafik Realtime CPU &amp; RAM</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: "0.75rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpu"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorCpu)"
                  name="CPU %"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Mengumpulkan data telemetri container...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
