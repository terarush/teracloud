import { TerminalView } from "../views/TerminalView"
import { Seo } from "@/components/seo"

interface TerminalPageProps {
  containerId: number
}

export const TerminalPage = ({ containerId }: TerminalPageProps) => {
  return (
    <>
      <Seo title="Terminal" path={`/app/containers/${containerId}/terminal`} robots="noindex, follow" />
      <TerminalView containerId={containerId} />
    </>
  )
}
