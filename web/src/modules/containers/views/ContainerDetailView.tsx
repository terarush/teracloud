import React, { useState } from "react"
import { useContainerDetail } from "../hooks/useContainerDetail"
import { StatusBadge } from "../components/StatusBadge"
import { ContainerActions } from "../components/ContainerActions"
import { ContainerStats } from "../components/ContainerStats"
import { ContainerEventsTable } from "../components/ContainerEventsTable"
import { Terminal } from "../components/Terminal"
import { ArrowLeft, Loader2, Terminal as TerminalIcon, BarChart3, ListOrdered, Info } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

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

  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "terminal" | "events">("overview")
  const navigate = useNavigate()

  if (isLoading || !container) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        <p>Memuat detail container...</p>
      </div>
    )
  }

  const assigned = container.assigned_ports || {}

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/app" })}
          className="gap-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
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
      <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {container.container_name}
            </h1>
            <StatusBadge status={container.status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            Image: {container.image_name}:{container.image_tag} &bull; Hostname: {container.hostname || "localhost"}
          </p>
        </div>

        <Button
          onClick={() =>
            navigate({
              to: "/app/containers/$id/terminal",
              params: { id: String(container.id) },
            })
          }
          className="gap-2 font-semibold self-start md:self-auto"
        >
          <TerminalIcon className="w-4 h-4" />
          <span>Buka Fullscreen Terminal</span>
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "overview"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>Overview &amp; Koneksi</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "stats"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Monitoring Resource</span>
        </button>

        <button
          onClick={() => setActiveTab("terminal")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "terminal"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <TerminalIcon className="w-4 h-4" />
          <span>Web Terminal (xterm.js)</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === "events"
              ? "border-primary text-primary font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Audit Log Event</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Alokasi Hardware</h2>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-muted/60 rounded-2xl">
                <div className="text-xs text-muted-foreground">vCPU</div>
                <div className="text-xl font-bold text-foreground mt-1">{container.cpu_limit} Core</div>
              </div>
              <div className="p-4 bg-muted/60 rounded-2xl">
                <div className="text-xs text-muted-foreground">RAM</div>
                <div className="text-xl font-bold text-foreground mt-1">{container.memory_limit} MB</div>
              </div>
              <div className="p-4 bg-muted/60 rounded-2xl">
                <div className="text-xs text-muted-foreground">Storage</div>
                <div className="text-xl font-bold text-foreground mt-1">{container.disk_limit} GB</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Koneksi &amp; Port Terbuka</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">SSH Port (Port 22 Internal):</span>
                <span className="font-mono font-bold text-primary">Port {assigned.ssh || "Belum dialokasikan"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">HTTP Web (Port 80 Internal):</span>
                <span className="font-mono font-bold text-primary">Port {assigned.http || "Belum dialokasikan"}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Waktu Dibuat:</span>
                <span className="text-foreground">{new Date(container.created_at).toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "stats" && (
        <ContainerStats stats={stats} memoryLimitMb={container.memory_limit} />
      )}

      {activeTab === "terminal" && (
        <div className="h-[520px] bg-card border border-border rounded-3xl p-2 shadow-xs overflow-hidden">
          <Terminal containerId={container.id} />
        </div>
      )}

      {activeTab === "events" && <ContainerEventsTable events={events} />}
    </div>
  )
}
