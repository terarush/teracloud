import {
  LayoutDashboard,
  Server,
  CreditCard,
  ShieldCheck,
  Package,
  ShoppingCart,
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
    groupName: "My Hosting",
    items: [
      { title: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
      { title: "Containers", href: "/app/dashboard", icon: Server },
      { title: "Billing", href: "/app/dashboard/billing", icon: CreditCard },
    ],
  },
  {
    groupName: "Admin",
    admin: true,
    items: [
      { title: "Admin Console", href: "/app/admin", icon: ShieldCheck },
      { title: "Hosting Plans", href: "/app/admin/plans", icon: Package },
      { title: "Orders", href: "/app/admin/orders", icon: ShoppingCart },
    ],
  },
]
