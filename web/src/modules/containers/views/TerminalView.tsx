import React from "react"
import { Terminal } from "../components/Terminal"
import { TerminalLayout } from "../layouts/TerminalLayout"

interface TerminalViewProps {
  containerId: number
}

export const TerminalView: React.FC<TerminalViewProps> = ({ containerId }) => {
  return (
    <TerminalLayout containerId={containerId}>
      <Terminal containerId={containerId} />
    </TerminalLayout>
  )
}
