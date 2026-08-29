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
import type { TFunction } from "i18next"

export interface SidebarItem {
  titleKey: string
  title: string
  href: string
  icon: LucideIcon | ComponentType<{ className?: string }>
  badge?: string
}

export interface SidebarGroupType {
  groupNameKey?: string
  groupName?: string
  admin?: boolean
  items: SidebarItem[]
}

export const getSidebarContentList = (t: TFunction): SidebarGroupType[] => [
  {
    groupName: t("nav.workspace", "Ruang Kerja"),
    items: [
      {
        titleKey: "hosting.dashboard",
        title: t("hosting.dashboard", "Dashboard"),
        href: "/app",
        icon: LayoutDashboard,
      },
      {
        titleKey: "hosting.yourContainers",
        title: t("hosting.yourContainers", "Containers"),
        href: "/app/containers",
        icon: Server,
      },
      {
        titleKey: "hosting.billingTitle",
        title: t("hosting.billingTitle", "Billing & Invoices"),
        href: "/app/billing",
        icon: CreditCard,
      },
      {
        titleKey: "hosting.orderSummary",
        title: t("hosting.orderSummary", "Orders & Checkout"),
        href: "/app/orders",
        icon: ShoppingCart,
      },
    ],
  },
  {
    groupName: t("nav.administration", "Administrasi"),
    admin: true,
    items: [
      {
        titleKey: "hosting.adminConsole",
        title: t("hosting.adminConsole", "Admin Console"),
        href: "/app/admin",
        icon: ShieldCheck,
      },
      {
        titleKey: "hosting.adminPlans",
        title: t("hosting.adminPlans", "Hosting Plans"),
        href: "/app/admin/plans",
        icon: Package,
      },
      {
        titleKey: "hosting.adminOrders",
        title: t("hosting.adminOrders", "Orders Transaksi"),
        href: "/app/admin/orders",
        icon: ShoppingCart,
      },
    ],
  },
]
