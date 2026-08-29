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

  const latest = stats.length > 0 ? stats[stats.length - 1] : null

  const cpuText = latest ? `${latest.cpu_usage_percent.toFixed(1)}%` : "0%"
  const ramText = latest ? `${latest.memory_usage_mb} MB / ${memoryLimitMb} MB` : `0 MB / ${memoryLimitMb} MB`
  const netText = latest ? `${(latest.network_rx_bytes / (1024 * 1024)).toFixed(2)} MB` : "0.00 MB"

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-card ring-1 ring-foreground/10 rounded-xl">
          <div className="text-xs text-muted-foreground">CPU Usage (Current)</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {cpuText}
          </div>
        </div>
        <div className="p-5 bg-card ring-1 ring-foreground/10 rounded-xl">
          <div className="text-xs text-muted-foreground">RAM Usage (Current)</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {ramText}
          </div>
        </div>
        <div className="p-5 bg-card ring-1 ring-foreground/10 rounded-xl">
          <div className="text-xs text-muted-foreground">Network I/O (Total)</div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {netText}
          </div>
        </div>
      </div>

      <div className="p-6 bg-card ring-1 ring-foreground/10 rounded-xl space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Grafik Realtime CPU &amp; RAM</h3>
        <div className="h-64 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="var(--border)" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <YAxis tick={{ fontSize: 10 }} unit="%" stroke="var(--muted-foreground)" />
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
                  stroke="var(--primary)"
                  fillOpacity={0.12}
                  fill="var(--primary)"
                  strokeWidth={1.5}
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
