import React, { useRef } from "react"
import { useTerminal } from "../hooks/useTerminal"

interface TerminalProps {
  containerId: number
  isActive?: boolean
}

export const Terminal: React.FC<TerminalProps> = ({ containerId, isActive }) => {
  const terminalRef = useRef<HTMLDivElement>(null)
  useTerminal({
    containerId,
    terminalContainerRef: terminalRef,
    isActive,
  })

  return (
    <div className="w-full h-full bg-[#09090b] dark:bg-[#09090b] p-3 overflow-hidden flex flex-col flex-1">
      <div ref={terminalRef} className="w-full h-full flex-1 overflow-hidden" />
    </div>
  )
}
