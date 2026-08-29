import React from "react"

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case "running":
      case "active":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      case "creating":
      case "provisioning":
        return "bg-sky-500/10 text-sky-500 border-sky-500/20"
      case "stopped":
      case "grace_period":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "suspended":
      case "error":
      case "failed":
      case "terminated":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full uppercase border ${getBadgeClass()}`}
    >
      {status}
    </span>
  )
}
