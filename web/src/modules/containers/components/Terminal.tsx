import React, { useRef } from "react"
import { useTerminal } from "../hooks/useTerminal"
import { Maximize2 } from "lucide-react"

interface TerminalProps {
  containerId: number
}

export const Terminal: React.FC<TerminalProps> = ({ containerId }) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  const { connected, statusText, fitTerminal } = useTerminal({
    containerId,
    terminalContainerRef: terminalRef,
  })

  return (
    <div className="flex flex-col h-full bg-[#090d16] rounded-2xl overflow-hidden border border-border shadow-inner">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#05070d] border-b border-border/80 text-xs">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              connected ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
            }`}
          />
          <span className="font-mono text-muted-foreground">{statusText}</span>
        </div>

        <button
          onClick={fitTerminal}
          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-muted/30 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition"
        >
          <Maximize2 className="w-3 h-3" />
          <span>Fit Screen</span>
        </button>
      </div>

      <div ref={terminalRef} className="flex-1 p-3 overflow-hidden" />
    </div>
  )
}
