import React from "react"

interface StatusBadgeProps {
  status: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = () => {
    switch (status) {
      case "running":
      case "active":
        return "bg-primary/10 text-primary"
      case "creating":
      case "provisioning":
        return "bg-muted text-muted-foreground"
      case "stopped":
      case "grace_period":
        return "bg-muted text-muted-foreground"
      case "suspended":
      case "error":
      case "failed":
      case "terminated":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wide ${getBadgeClass()}`}
    >
      {status}
    </span>
  )
}
