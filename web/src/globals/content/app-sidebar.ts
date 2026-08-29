import {
  LayoutDashboard,
  Users,
  Settings,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"

export interface SidebarItem {
  title: string
  href: string
  icon: LucideIcon | ComponentType<{ className?: string }>
  badge?: string
}

export interface SidebarGroupType {
  groupName?: string
  admin?: boolean
  items: SidebarItem[]
}

export const sidebarContentList: SidebarGroupType[] = [
  {
    groupName: "Workspace",
    items: [
      { title: "Dashboard", href: "/app", icon: LayoutDashboard },
      { title: "Users", href: "/app/users", icon: Users },
      { title: "Settings", href: "/app/settings", icon: Settings },
    ],
  },
]
