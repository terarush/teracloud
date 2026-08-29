import React from "react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

interface TerminalLayoutProps {
  containerId: number
  children: React.ReactNode
}

export const TerminalLayout: React.FC<TerminalLayoutProps> = ({ containerId, children }) => {
  const navigate = useNavigate()

  return (
    <div className="h-screen w-screen flex flex-col bg-[#05070d] text-foreground overflow-hidden">
      <header className="h-12 border-b border-border/40 px-4 flex items-center justify-between bg-[#080b12]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({
                to: "/app/containers/$id",
                params: { id: String(containerId) },
              })
            }
            className="h-8 text-xs gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Container</span>
          </Button>
          <span className="text-xs text-muted-foreground font-mono">
            /app/containers/{containerId}/terminal
          </span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-2">{children}</main>
    </div>
  )
}
