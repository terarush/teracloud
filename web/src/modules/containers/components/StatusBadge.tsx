import React from "react"
import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getBadgeClass = () => {
    switch (status.toLowerCase()) {
      case "running":
      case "active":
      case "paid":
      case "completed":
        return "bg-primary/10 text-primary"
      case "pending":
      case "waiting_payment":
      case "grace_period":
        return "bg-secondary text-secondary-foreground"
      case "creating":
      case "provisioning":
      case "stopped":
      case "cancelled":
      case "expired":
        return "bg-muted text-muted-foreground"
      case "suspended":
      case "error":
      case "failed":
      case "terminated":
      case "refunded":
        return "bg-destructive/10 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Badge
      className={`text-[10px] h-4 px-1.5 border-0 font-medium ${getBadgeClass()} ${className}`}
    >
      {status}
    </Badge>
  )
}
