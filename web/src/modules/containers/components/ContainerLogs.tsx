import React, { useRef, useEffect } from "react"
import { useContainerLogsQuery } from "@/service/query/containers"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface ContainerLogsProps {
  containerId: number
  isActive?: boolean
}

export const ContainerLogs: React.FC<ContainerLogsProps> = ({ containerId, isActive = true }) => {
  const { t } = useTranslation()
  const { data: logs, isLoading } = useContainerLogsQuery(containerId, isActive)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on first load or when logs change
  useEffect(() => {
    if (scrollRef.current && logs) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <Card className="ring-1 ring-foreground/10 overflow-hidden flex flex-col h-[540px]">
      <div
        ref={scrollRef}
        className="flex-1 bg-[#09090b] text-[#f4f4f5] font-mono text-xs p-4 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text"
      >
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
