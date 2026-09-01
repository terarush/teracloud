import {
  LayoutDashboard,
  Server,
  CreditCard,
  ShieldCheck,
  Package,
  ShoppingCart,
  ScrollText,
  User,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"
import i18n from "@/lib/i18n"

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

export const getSidebarContentList = (
  customT?: (key: string, defaultValue?: string) => string
): SidebarGroupType[] => {
  const translate = typeof customT === "function" ? customT : (k: string, d?: string) => i18n.t(k, d || "")

  return [
    {
      groupName: translate("nav.workspace", "Ruang Kerja"),
      items: [
        {
          titleKey: "hosting.dashboard",
          title: translate("hosting.dashboard", "Dashboard"),
          href: "/app",
          icon: LayoutDashboard,
        },
        {
          titleKey: "hosting.yourContainers",
          title: translate("hosting.yourContainers", "Containers"),
          href: "/app/containers",
          icon: Server,
        },
        {
          titleKey: "hosting.cart",
          title: translate("hosting.cart", "Keranjang Belanja"),
          href: "/app/cart",
          icon: ShoppingCart,
        },
        {
          titleKey: "hosting.billingTitle",
          title: translate("hosting.billingTitle", "Billing & Invoices"),
          href: "/app/billing",
          icon: CreditCard,
        },
        {
          titleKey: "hosting.orderSummary",
          title: translate("hosting.orderSummary", "Orders Transaksi"),
          href: "/app/orders",
          icon: Package,
        },
        {
          titleKey: "nav.userProfile",
          title: translate("nav.userProfile", "User Profile"),
          href: "/app/profile",
          icon: User,
        },
      ],
    },
    {
      groupName: translate("nav.administration", "Administrasi"),
      admin: true,
      items: [
        {
          titleKey: "hosting.adminConsole",
          title: translate("hosting.adminConsole", "Admin Console"),
          href: "/app/console",
          icon: ShieldCheck,
        },
        {
          titleKey: "hosting.adminPlans",
          title: translate("hosting.adminPlans", "Hosting Plans"),
          href: "/app/plans",
          icon: Package,
        },
        {
          titleKey: "hosting.adminOrders",
          title: translate("hosting.adminOrders", "Orders Transaksi"),
          href: "/app/orders-list",
          icon: ShoppingCart,
        },
        {
          titleKey: "hosting.adminContainers",
          title: translate("hosting.adminContainers", "Semua Container"),
          href: "/app/admin/containers",
          icon: Server,
        },
        {
          titleKey: "hosting.adminAudit",
          title: translate("hosting.adminAudit", "Log Audit"),
          href: "/app/admin/audit",
          icon: ScrollText,
        },
      ],
    },
  ]
}

export const sidebarContentList = getSidebarContentList()
