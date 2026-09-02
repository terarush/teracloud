import { useMemo } from "react"
import { useRouterState, useNavigate } from "@tanstack/react-router"
import { LogOut, Moon, Sun, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/theme-provider"
import { useCartQuery } from "@/service/query/cart"
import { companyMeta } from "@/meta"
import { getSidebarContentList } from "@/globals/content/app-sidebar"
import { currentLocale, changeLocale } from "@/lib/i18n"
import { useTranslation } from "react-i18next"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  useSidebar,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
} from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"

export function AppSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()
  const { data: cart } = useCartQuery()

  const activeLocale = currentLocale()
  const isAdmin = user?.role === "admin"
  const cartItemCount = cart ? (cart.total_items || cart.items.length || 0) : 0

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    const nextLocale = activeLocale === "en" ? "id" : "en"
    changeLocale(nextLocale)
  }

  const handleLogout = async () => {
    await logout()
    navigate({ to: "/login" as any })
  }

  const handleItemClick = (href: string) => {
    if (isMobile) setOpenMobile(false)
    navigate({ to: href as any })
  }

  const sidebarList = useMemo(() => getSidebarContentList(t), [i18n.language, t])

  const filteredSidebarContent = sidebarList.filter((group) => {
    if (group.admin && !isAdmin) return false
    return true
  })

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="h-14 flex flex-row items-center justify-center border-b border-border/50 group-data-[collapsible=icon]:px-0">
        <div
          className="flex items-center gap-2.5 overflow-hidden w-full px-5 cursor-pointer group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => handleItemClick("/app")}
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
            {companyMeta.name.charAt(0) || "T"}
          </div>
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
            {companyMeta.name}
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-3">
        {filteredSidebarContent.map((group, idx) => (
          <SidebarGroup key={group.groupNameKey || idx}>
            {group.groupName && (
              <SidebarGroupLabel>
                {group.groupName}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href
                  const badgeValue = item.href === "/app/cart" && cartItemCount > 0 ? String(cartItemCount) : item.badge

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleItemClick(item.href)}
                        tooltip={item.title}
                        className={cn("cursor-pointer")}
                      >
                        <Icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {badgeValue && (
                        <SidebarMenuBadge className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors">
                          {badgeValue}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2 group-data-[collapsible=icon]:p-1.5">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={`${user.first_name} ${user.last_name || ""}`}
                onClick={() => handleItemClick("/app/profile")}
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-lg hover:bg-sidebar-accent/60 text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1 cursor-pointer transition-all mb-1"
              >
                <UserAvatar user={user} className="size-7 group-data-[collapsible=icon]:size-5 shrink-0 ring-1 ring-white/20 transition-all" />
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold text-sidebar-foreground">
                    {user.first_name} {user.last_name || ""}
                  </span>
                  <span className="truncate text-[11px] font-medium text-sidebar-foreground/80">
                    {user.email}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleLanguage}
              tooltip={activeLocale === "en" ? t("nav.switchToId") : t("nav.switchToEn")}
              className="cursor-pointer justify-between group-data-[collapsible=icon]:justify-center"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Languages className="size-4 shrink-0" />
                <span className="truncate group-data-[collapsible=icon]:hidden">
                  {activeLocale === "en" ? t("nav.languageLabelEn") : t("nav.languageLabelId")}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-accent-foreground border border-border/50 group-data-[collapsible=icon]:hidden">
                {activeLocale}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              tooltip={theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}
              className="cursor-pointer"
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <span>{theme === "light" ? t("nav.darkMode") : t("nav.lightMode")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip={t("nav.signOut")}
              className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
              <span>{t("nav.signOut")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
