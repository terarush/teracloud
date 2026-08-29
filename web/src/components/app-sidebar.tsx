import { useRouterState, useNavigate } from "@tanstack/react-router"
import { LogOut, Moon, Sun, Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/theme-provider"
import { companyMeta } from "@/meta"
import { sidebarContentList } from "@/globals/content/app-sidebar"
import { currentLocale, changeLocale, type Locale } from "@/lib/i18n"
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
  const { t } = useTranslation()

  const isAdmin = user?.role === "admin"
  const activeLang = currentLocale()

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
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar select-none">
      {/* 1. Header with Logo & Brand */}
      <SidebarHeader className="h-14 border-b border-border/50 p-0 flex flex-row items-center">
        <div
          className="flex items-center gap-3 cursor-pointer overflow-hidden w-full h-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
          onClick={() => handleItemClick("/app")}
        >
          <img
            src={logoSrc}
            alt={companyMeta.name}
            className="size-7 rounded-lg object-contain shrink-0 ring-1 ring-primary/20"
          />
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground truncate">
              {companyMeta.name}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              Cloud Console
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* 2. Content & Nav Groups */}
      <SidebarContent className="px-2 py-4 gap-6 group-data-[collapsible=icon]:px-0">
        {sidebarContentList.map((group, idx) => {
          if (group.admin && !isAdmin) return null

          return (
            <SidebarGroup key={idx} className="p-0 group-data-[collapsible=icon]:px-0">
              {group.groupName && (
                <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 group-data-[collapsible=icon]:hidden">
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
                            "h-9 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                            isActive
                              ? "bg-primary/10 text-primary hover:bg-primary/15 font-semibold"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
      <SidebarFooter className="border-t border-border/50 p-2 gap-1.5 group-data-[collapsible=icon]:p-1.5 group-data-[collapsible=icon]:py-2">
        {/* User Profile Card with Dropdown Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center justify-between p-2 rounded-xl bg-muted/40 hover:bg-muted/80 border border-border/40 transition-colors text-left group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center cursor-pointer outline-hidden">
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
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  Light
                </span>
                {theme === "light" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setTheme("dark")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  Dark
                </span>
                {theme === "dark" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Sign Out */}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer rounded-lg gap-2"
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
