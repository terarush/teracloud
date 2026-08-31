import React, { useState, useEffect } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import type { ContainerStats as ContainerStatsType } from "@/service/api/containers"
import { Card, CardContent } from "@/components/ui/card"
import { Cpu, HardDrive, Activity, ArrowDownLeft, ArrowUpRight, Gauge } from "lucide-react"

interface ContainerStatsProps {
  stats: ContainerStatsType[] | ContainerStatsType | null | undefined
  memoryLimitMb: number
}

interface TelemetryPoint {
  time: string
  cpu: number
  memory: number
  memoryPercent: number
  netRxMb: number
  netTxMb: number
  rawRecordedAt: string
}

export const ContainerStats: React.FC<ContainerStatsProps> = ({ stats, memoryLimitMb }) => {
  const [history, setHistory] = useState<TelemetryPoint[]>([])

  // Normalize stats to array and append new live points into rolling buffer
  useEffect(() => {
    if (!stats) return

    const incomingList: ContainerStatsType[] = Array.isArray(stats)
      ? stats
      : [stats]

    if (incomingList.length === 0) return

    setHistory((prev) => {
      const updated = [...prev]

      incomingList.forEach((s) => {
        const recorded = s.recorded_at || new Date().toISOString()
        // Check if this timestamp is already the most recent point
        const last = updated[updated.length - 1]
        if (last && last.rawRecordedAt === recorded) {
          return
        }

        const memMb = s.memory_usage_mb || 0
        const limit = memoryLimitMb > 0 ? memoryLimitMb : (s.memory_limit_mb || 1024)
        const memPercent = Math.min(100, Math.round((memMb / limit) * 100))

        const timeStr = new Date(recorded).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })

        const point: TelemetryPoint = {
          time: timeStr,
          cpu: Number((s.cpu_usage_percent || 0).toFixed(1)),
          memory: memMb,
          memoryPercent: memPercent,
          netRxMb: Number(((s.network_rx_bytes || 0) / (1024 * 1024)).toFixed(2)),
          netTxMb: Number(((s.network_tx_bytes || 0) / (1024 * 1024)).toFixed(2)),
          rawRecordedAt: recorded,
        }

        updated.push(point)
      })

      // Keep maximum 25 points for smooth responsive rolling chart
      return updated.slice(-25)
    })
  }, [stats, memoryLimitMb])

  const latest = history.length > 0 ? history[history.length - 1] : null

  const cpuText = latest ? `${latest.cpu}%` : "0%"
  const ramText = latest ? `${latest.memory} MB / ${memoryLimitMb} MB` : `0 MB / ${memoryLimitMb} MB`
  const ramPercentText = latest ? `${latest.memoryPercent}%` : "0%"
  const rxText = latest ? `${latest.netRxMb} MB` : "0.00 MB"
  const txText = latest ? `${latest.netTxMb} MB` : "0.00 MB"

  return (
    <div className="space-y-6">
      {/* Realtime Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="ring-1 ring-foreground/10 shadow-sm">
          <CardContent className="py-4 px-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold">CPU Usage</span>
              <Cpu className="size-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">{cpuText}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Beban prosesor terkini</p>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10 shadow-sm">
          <CardContent className="py-4 px-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold">RAM Usage</span>
              <HardDrive className="size-4 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">{ramPercentText}</p>
              <span className="text-xs text-muted-foreground font-mono">({ramText})</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Alokasi memori fisik</p>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10 shadow-sm">
          <CardContent className="py-4 px-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold">Network RX (Download)</span>
              <ArrowDownLeft className="size-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">{rxText}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total paket data masuk</p>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-foreground/10 shadow-sm">
          <CardContent className="py-4 px-4">
            <div className="flex items-center justify-between text-muted-foreground mb-1.5">
              <span className="text-xs font-semibold">Network TX (Upload)</span>
              <ArrowUpRight className="size-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-foreground">{txText}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Total paket data keluar</p>
          </CardContent>
        </Card>
      </div>

      {/* Dual Graphs: CPU Trend & RAM Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CPU Trend Graph */}
        <Card className="ring-1 ring-foreground/10 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Grafik Realtime CPU (%)</h3>
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                Live: {cpuText}
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="currentColor" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#888888" />
                    <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} stroke="#888888" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`${val}%`, "CPU Usage"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="var(--primary)"
                      fillOpacity={1}
                      fill="url(#cpuGradient)"
                      strokeWidth={2}
                      name="CPU"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  <Activity className="size-4 animate-spin mr-2" />
                  Mengumpulkan data telemetri CPU...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RAM Trend Graph */}
        <Card className="ring-1 ring-foreground/10 shadow-sm">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="size-4 text-sky-500" />
                <h3 className="text-sm font-semibold text-foreground">Grafik Realtime RAM (MB)</h3>
              </div>
              <span className="text-xs font-mono font-medium text-muted-foreground">
                Maks: {memoryLimitMb} MB
              </span>
            </div>

            <div className="h-60 w-full pt-2">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke="currentColor" />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#888888" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      unit="MB"
                      domain={[0, memoryLimitMb || "auto"]}
                      stroke="#888888"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                      }}
                      formatter={(val: any) => [`${val} MB`, "RAM Usage"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#memGradient)"
                      strokeWidth={2}
                      name="Memory"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  <Activity className="size-4 animate-spin mr-2" />
                  Mengumpulkan data telemetri RAM...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
