import { useMemo } from "react"
import { useRouterState, useNavigate } from "@tanstack/react-router"
import { LogOut, Moon, Sun, Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/theme-provider"
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
} from "@/components/ui/sidebar"
import { UserAvatar } from "@/components/user-avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function AppSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()
  const { t, i18n } = useTranslation()

  const isAdmin = user?.role === "admin"
  const activeLang = currentLocale()

  const sidebarList = useMemo(() => getSidebarContentList(t), [i18n.language, t])

  const handleLogout = async () => {
    await logout()
    navigate({ to: "/login" as any })
  }

  const handleItemClick = (href: string) => {
    if (isMobile) setOpenMobile(false)
    navigate({ to: href as any })
  }

  const logoSrc = theme === "dark" && companyMeta.logoWhite ? companyMeta.logoWhite : companyMeta.logo

  return (
    <Sidebar collapsible="icon" className="select-none border-r border-sidebar-border bg-sidebar">
      {/* 1. Header with Logo & Brand */}
      <SidebarHeader className="flex h-16 flex-row items-center border-b border-sidebar-border p-0">
        <div
          className="flex h-full w-full cursor-pointer items-center gap-3 overflow-hidden px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
          onClick={() => handleItemClick("/app")}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">T</span>
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground truncate">
              {companyMeta.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              Container workspace
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Content & Nav Groups */}
      <SidebarContent className="gap-7 px-2 py-5 group-data-[collapsible=icon]:px-0">
        {sidebarList.map((group, idx) => {
          if (group.admin && !isAdmin) return null

          return (
            <SidebarGroup key={idx} className="p-0 group-data-[collapsible=icon]:px-0">
              {group.groupName && (
                <SidebarGroupLabel className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground group-data-[collapsible=icon]:hidden">
                  {group.groupName}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPath === item.href

                    return (
                      <SidebarMenuItem
                        key={item.href}
                        className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center w-full"
                      >
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          onClick={() => handleItemClick(item.href)}
                          className={cn(
                            "h-9 cursor-pointer rounded-lg px-3 text-[13px] font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                                            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          )}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>

      {/* 3. Refined Footer */}
      <SidebarFooter className="gap-1.5 border-t border-sidebar-border p-2.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:py-2">
        {/* User Profile Card with Dropdown Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="flex w-full cursor-pointer items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-muted group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar user={user} className="h-7 w-7 shrink-0 rounded-lg ring-1 ring-border" />
              <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-semibold text-foreground truncate">
                  {user ? `${user.first_name} ${user.last_name ?? ""}`.trim() : "User"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {user?.email ?? ""}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side="top" className="w-56 p-1.5 rounded-xl">
            <div className="text-xs font-normal text-muted-foreground px-2 py-1.5">
              Signed in as <strong className="text-foreground">{user?.email}</strong>
            </div>
            <DropdownMenuSeparator />

            {/* Language Selection */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 pt-2">
                Language / Bahasa
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => changeLocale("id")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  Bahasa Indonesia
                </span>
                {activeLang === "id" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLocale("en")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  English (US)
                </span>
                {activeLang === "en" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Theme Selection */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 pt-1">
                Theme Mode
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setTheme("light")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </span>
                {theme === "light" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </span>
                {theme === "dark" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Sign Out */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t("nav.signOut", "Keluar")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
