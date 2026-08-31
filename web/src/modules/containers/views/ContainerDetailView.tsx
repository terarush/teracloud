import React, { useState } from "react"
import { useContainerDetail } from "../hooks/useContainerDetail"
import { StatusBadge } from "../components/StatusBadge"
import { ContainerActions } from "../components/ContainerActions"
import { ContainerStats } from "../components/ContainerStats"
import { ContainerEventsTable } from "../components/ContainerEventsTable"
import { Terminal } from "../components/Terminal"
import { ContainerLogs } from "../components/ContainerLogs"
import { ArrowLeft, Loader2, Terminal as TerminalIcon, BarChart3, ListOrdered, Info, ExternalLink, FileText } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ContainerDetailViewProps {
  containerId: number
}

export const ContainerDetailView: React.FC<ContainerDetailViewProps> = ({ containerId }) => {
  const {
    container,
    events,
    stats,
    isLoading,
    isPending,
    handleStart,
    handleStop,
    handleRestart,
    handleReset,
    handleDelete,
  } = useContainerDetail(containerId)

  const [activeTab, setActiveTab] = useState<"overview" | "terminal" | "logs" | "stats" | "events">("overview")
  const navigate = useNavigate()

  if (isLoading || !container) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary mb-3" />
        <p className="text-xs">Memuat detail container...</p>
      </div>
    )
  }

  const assigned = container.assigned_ports || {}

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/app" })}
          className="gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7 self-start"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Dashboard</span>
        </Button>

        <ContainerActions
          containerId={container.id}
          status={container.status}
          onStart={handleStart}
          onStop={handleStop}
          onRestart={handleRestart}
          onReset={handleReset}
          onDelete={handleDelete}
          isPending={isPending}
        />
      </div>

      {/* Main Info Card */}
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                {container.container_name}
              </h1>
              <StatusBadge status={container.status} />
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Image: {container.image_name}:{container.image_tag} &bull; Hostname: {container.hostname || "localhost"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-foreground/10 pb-px">
        {[
          { key: "overview", label: "Overview" },
          { key: "terminal", label: "Terminal" },
          { key: "logs", label: "Log Output" },
          { key: "stats", label: "Resource" },
          { key: "events", label: "Audit Log" },
        ].map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                isActive
                  ? "border-primary text-foreground font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels with persistent Terminal session */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Alokasi Hardware</h2>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-[11px] text-muted-foreground">vCPU</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{container.cpu_limit} Core</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-[11px] text-muted-foreground">RAM</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{container.memory_limit} MB</div>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="text-[11px] text-muted-foreground">Storage</div>
                  <div className="text-base font-bold text-foreground mt-0.5">{container.disk_limit} GB</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="ring-1 ring-foreground/10">
            <CardContent className="p-5 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Akses Domain &amp; Layanan</h2>
              <div className="space-y-2 text-xs">
                {container.tunnel_routes && container.tunnel_routes.length > 0 ? (
                  container.tunnel_routes.map((route, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground capitalize font-medium">{route.name.replace("_", " ")}:</span>
                      <a
                        href={route.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 font-mono font-semibold text-primary hover:underline"
                      >
                        {route.url} <ExternalLink className="size-3" />
                      </a>
                    </div>
                  ))
                ) : Object.keys(assigned).length > 0 ? (
                  Object.entries(assigned).map(([name, port]) => (
                    <div key={name} className="flex justify-between items-center py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground capitalize font-medium">{name.replace("_", " ")}:</span>
                      <span className="font-mono text-muted-foreground">Port {port} (Menunggu DNS)</span>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-muted-foreground italic">
                    Belum ada port atau domain yang dialokasikan
                  </div>
                )}
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-muted-foreground">Waktu Dibuat:</span>
                  <span className="text-foreground">{new Date(container.created_at).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Terminal is kept mounted to maintain WebSocket & history state */}
      <div className={activeTab === "terminal" ? "block" : "hidden"}>
        <Card className="ring-1 ring-foreground/10 overflow-hidden h-[540px] flex flex-col">
          <Terminal containerId={container.id} isActive={activeTab === "terminal"} />
        </Card>
      </div>

      {activeTab === "logs" && (
        <ContainerLogs containerId={container.id} />
      )}

      {activeTab === "stats" && (
        <ContainerStats stats={stats} memoryLimitMb={container.memory_limit} />
      )}

      {activeTab === "events" && <ContainerEventsTable events={events} />}
    </div>
  )
}
