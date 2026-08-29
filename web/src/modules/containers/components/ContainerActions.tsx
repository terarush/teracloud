import React from "react"
import { Play, Square, RotateCw, RefreshCcw, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContainerActionsProps {
  containerId: number
  status: string
  onStart: () => void
  onStop: () => void
  onRestart: () => void
  onReset: (mode: "soft" | "hard") => void
  onDelete: () => void
  isPending: boolean
}

export const ContainerActions: React.FC<ContainerActionsProps> = ({
  status,
  onStart,
  onStop,
  onRestart,
  onReset,
  onDelete,
  isPending,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "running" ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={onStop}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Square className="w-4 h-4 mr-1" />}
          Stop
        </Button>
      ) : (
        <Button
          variant="default"
          size="sm"
          disabled={isPending}
          onClick={onStart}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Play className="w-4 h-4 mr-1" />}
          Start
        </Button>
      )}

      <Button variant="secondary" size="sm" disabled={isPending} onClick={onRestart}>
        <RotateCw className="w-4 h-4 mr-1" />
        Restart
      </Button>

      <Button
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() => onReset("soft")}
      >
        <RefreshCcw className="w-4 h-4 mr-1" />
        Soft Reset
      </Button>

      <Button
        variant="destructive"
        size="sm"
        disabled={isPending}
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4 mr-1" />
        Hapus
      </Button>
    </div>
  )
}
