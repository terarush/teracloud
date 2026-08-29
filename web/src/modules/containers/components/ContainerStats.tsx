import React from "react"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { ContainerStats as ContainerStatsType } from "@/service/api/containers"
import { Card, CardContent } from "@/components/ui/card"
import { Cpu, HardDrive, Activity } from "lucide-react"

interface ContainerStatsProps {
  stats: ContainerStatsType[] | ContainerStatsType | null | undefined
  memoryLimitMb: number
}

export const ContainerStats: React.FC<ContainerStatsProps> = ({ stats, memoryLimitMb }) => {
  // Normalize stats to array
  const statsList: ContainerStatsType[] = Array.isArray(stats)
    ? stats
    : stats && typeof stats === "object"
      ? [stats]
      : []

  const chartData = statsList.slice(-20).map((s) => ({
    time: s.recorded_at
      ? new Date(s.recorded_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "Sekarang",
    cpu: s.cpu_usage_percent || 0,
    memory: s.memory_usage_mb || 0,
  }))

  const latest = statsList.length > 0 ? statsList[statsList.length - 1] : null

  const cpuText = latest?.cpu_usage_percent !== undefined ? `${latest.cpu_usage_percent.toFixed(1)}%` : "0%"
  const ramText = latest?.memory_usage_mb !== undefined ? `${latest.memory_usage_mb} MB / ${memoryLimitMb} MB` : `0 MB / ${memoryLimitMb} MB`
  const netText = latest?.network_rx_bytes !== undefined ? `${(latest.network_rx_bytes / (1024 * 1024)).toFixed(2)} MB` : "0.00 MB"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Cpu className="size-4" />
              <span className="text-xs font-medium">CPU Usage</span>
            </div>
            <p className="text-xl font-bold text-foreground">{cpuText}</p>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <HardDrive className="size-4" />
              <span className="text-xs font-medium">RAM Usage</span>
            </div>
            <p className="text-xl font-bold text-foreground">{ramText}</p>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="size-4" />
              <span className="text-xs font-medium">Network I/O</span>
            </div>
            <p className="text-xl font-bold text-foreground">{netText}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-5 space-y-3">
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
                      borderRadius: "0.5rem",
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
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                Mengumpulkan data telemetri container...
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
