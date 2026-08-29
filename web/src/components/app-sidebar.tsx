import { useRouterState, useNavigate } from "@tanstack/react-router"
import { LogOut, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/theme-provider"
import { companyMeta } from "@/meta"
import { sidebarContentList } from "@/globals/content/app-sidebar"

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

export function AppSidebar() {
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isMobile, setOpenMobile } = useSidebar()
  const { theme, setTheme } = useTheme()

  const isAdmin = user?.role === "admin"

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

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
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar">
      {/* 1. Header with Logo & Brand */}
      <SidebarHeader className="h-14 border-b border-border/50 p-0 flex flex-row items-center">
        <div
          className="flex items-center gap-3 cursor-pointer overflow-hidden w-full h-full px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center"
          onClick={() => handleItemClick("/app")}
        >
          <img
            src={logoSrc}
            alt={companyMeta.name}
            className="size-7 rounded-lg object-contain shrink-0"
          />
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-foreground truncate">
              {companyMeta.name}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
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
                <SidebarGroupLabel className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                  {group.groupName}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPath === item.href

                    return (
                      <SidebarMenuItem key={item.href} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center w-full">
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
                          <Icon />
                          <span>{item.title}</span>
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

      {/* 3. Footer with Theme Switcher & User Profile */}
      <SidebarFooter className="border-t border-border/50 p-2 gap-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:py-2">
        <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:px-0">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:justify-center cursor-pointer p-1.5 rounded-md hover:bg-muted"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500 shrink-0" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 shrink-0" />
            )}
            <span className="text-xs group-data-[collapsible=icon]:hidden">Theme</span>
          </button>

          <button
            onClick={handleLogout}
            title="Logout"
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-muted group-data-[collapsible=icon]:justify-center cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg bg-card/60 border border-border/40 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
          <UserAvatar user={user} className="h-7 w-7 shrink-0 ring-1 ring-primary/20" />
          <div className="flex flex-col truncate group-data-[collapsible=icon]:hidden">
            <span className="text-xs font-semibold text-foreground truncate">
              {user ? `${user.first_name} ${user.last_name ?? ""}`.trim() : "User"}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {user?.email ?? ""}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
