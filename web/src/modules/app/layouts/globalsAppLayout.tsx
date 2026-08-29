import { useMemo, useRef } from "react"
import { Outlet, useRouterState, useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { LogOut, Moon, Sun, Globe, Check } from "lucide-react"

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/components/theme-provider"
import { sidebarContentList } from "@/globals/content/app-sidebar"
import { currentLocale, changeLocale } from "@/lib/i18n"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"

function AppHeader({ pageTitle }: { pageTitle: string }) {
  const { state, isMobile } = useSidebar()
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const activeLang = currentLocale()

  const leftOffset = isMobile
    ? "0px"
    : state === "collapsed"
    ? SIDEBAR_WIDTH_ICON
    : SIDEBAR_WIDTH

  const handleLogout = async () => {
    await logout()
    navigate({ to: "/login" as any })
  }

  return (
    <header
      style={{ left: leftOffset }}
      className="fixed top-0 right-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-border/50 px-6 bg-card/60 backdrop-blur-md transition-[left] duration-200 ease-linear"
    >
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="h-4 w-px bg-border/60" />
        <h1 className="text-sm font-bold text-foreground tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Language Switcher Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 gap-1.5 text-xs font-semibold rounded-lg cursor-pointer shadow-2xs"
            >
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="uppercase">{activeLang}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 p-1.5 rounded-xl">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider px-2 py-1">
                {t("common.language", "Language / Bahasa")}
              </DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => changeLocale("id")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span>Bahasa Indonesia</span>
                {activeLang === "id" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLocale("en")}
                className="flex items-center justify-between text-xs cursor-pointer rounded-lg"
              >
                <span>English (US)</span>
                {activeLang === "en" && <Check className="w-3.5 h-3.5 text-primary" />}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-8 w-8 p-0 rounded-lg cursor-pointer shadow-2xs"
          title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-500" />
          )}
        </Button>

        {/* Logout Quick Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 border-border/80 cursor-pointer shadow-2xs"
          title={t("nav.signOut", "Keluar")}
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-border/60 mx-1" />

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="flex-col text-right hidden md:flex">
            <span className="text-xs font-bold text-foreground">
              {user ? `${user.first_name} ${user.last_name || ""}` : "User"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {user?.email || ""}
            </span>
          </div>
          <UserAvatar user={user} className="h-8 w-8 ring-2 ring-primary/20 rounded-xl" />
        </div>
      </div>
    </header>
  )
}

export function GlobalsAppLayout() {
  const route = useRouterState()
  const currentPath = route.location.pathname
  const mainRef = useRef<HTMLElement>(null)
  const { t } = useTranslation()

  const pageTitle = useMemo(() => {
    for (const group of sidebarContentList) {
      const matched = group.items.find((item) => item.href === currentPath)
      if (matched) return matched.title
    }
    return t("hosting.dashboard", "Dashboard")
  }, [currentPath, t])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AppHeader pageTitle={pageTitle} />

          {/* Spacer for fixed header */}
          <div className="h-14 shrink-0" />

          <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 min-w-0">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
