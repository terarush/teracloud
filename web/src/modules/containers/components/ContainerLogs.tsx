import React, { useState } from "react"
import { useContainerLogsQuery } from "@/service/query/containers"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Terminal, Download, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"

interface ContainerLogsProps {
  containerId: number
  isActive?: boolean
}

export const ContainerLogs: React.FC<ContainerLogsProps> = ({ containerId, isActive = true }) => {
  const { t } = useTranslation()
  const { data: logs, isLoading, isFetching, refetch } = useContainerLogsQuery(containerId, isActive)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!logs) return
    navigator.clipboard.writeText(logs)
    setCopied(true)
    toast.success(t("hosting.logCopiedToast", "Log berhasil disalin ke clipboard!"))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!logs) return
    const blob = new Blob([logs], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `container-${containerId}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="ring-1 ring-foreground/10 overflow-hidden flex flex-col h-[540px]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Terminal className="size-4 text-primary" />
          <span>{t("hosting.logTitle", "Container Stdout / Stderr Output")}</span>
          {isFetching && <Loader2 className="size-3 animate-spin text-muted-foreground ml-1" />}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-7 text-xs gap-1 cursor-pointer"
          >
            <RefreshCw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
            <span>{t("hosting.refresh", "Refresh")}</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleCopy}
            disabled={!logs}
            className="h-7 text-xs gap-1 cursor-pointer"
          >
            {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span>{copied ? t("hosting.copied", "Tersalin") : t("hosting.copy", "Salin")}</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleDownload}
            disabled={!logs}
            className="h-7 text-xs gap-1 cursor-pointer"
          >
            <Download className="size-3" />
            <span>{t("hosting.download", "Unduh")}</span>
          </Button>
        </div>
      </div>

      <div className="flex-1 bg-[#09090b] text-[#f4f4f5] font-mono text-xs p-4 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin mb-2 text-primary" />
            <span>{t("hosting.fetchingLogs", "Mengambil log container...")}</span>
          </div>
        ) : !logs || logs.trim() === "" ? (
          <div className="h-full flex items-center justify-center text-muted-foreground/60 italic">
            {t("hosting.noLogs", "Belum ada output log dari container.")}
          </div>
        ) : (
          logs
        )}
      </div>
    </Card>
  )
}
