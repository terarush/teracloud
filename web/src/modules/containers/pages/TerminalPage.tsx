import { TerminalView } from "../views/TerminalView"

interface TerminalPageProps {
  containerId: number
}

export const TerminalPage = ({ containerId }: TerminalPageProps) => {
  return <TerminalView containerId={containerId} />
}
