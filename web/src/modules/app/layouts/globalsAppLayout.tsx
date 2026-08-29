import { useMemo, useRef } from "react"
import { Outlet, useRouterState } from "@tanstack/react-router"

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useAuth } from "@/contexts/auth-context"
import { sidebarContentList } from "@/globals/content/app-sidebar"
import { UserAvatar } from "@/components/user-avatar"

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "3rem"

function AppHeader({ pageTitle }: { pageTitle: string }) {
  const { state, isMobile } = useSidebar()
  const { user } = useAuth()

  const leftOffset = isMobile
    ? "0px"
    : state === "collapsed"
    ? SIDEBAR_WIDTH_ICON
    : SIDEBAR_WIDTH

  return (
    <header
      style={{ left: leftOffset }}
      className="fixed top-0 right-0 z-50 flex h-14 items-center justify-between gap-2 border-b border-border/50 px-6 bg-card/50 backdrop-blur-md transition-[left] duration-200 ease-linear"
    >
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="h-4 w-px bg-border/60" />
        <h1 className="text-sm font-bold text-foreground tracking-tight">
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-col text-right hidden sm:flex">
          <span className="text-xs font-bold text-foreground">
            {user ? `${user.first_name} ${user.last_name || ""}` : "Loading..."}
          </span>
          <span className="text-xs text-muted-foreground">
            {user?.email || "Loading..."}
          </span>
        </div>
        <UserAvatar user={user} className="h-8 w-8 ring-2 ring-primary/10" />
      </div>
    </header>
  )
}

export function GlobalsAppLayout() {
  const route = useRouterState()
  const currentPath = route.location.pathname
  const mainRef = useRef<HTMLElement>(null)

  const pageTitle = useMemo(() => {
    for (const group of sidebarContentList) {
      const matched = group.items.find((item) => item.href === currentPath)
      if (matched) return matched.title
    }
    return "Dashboard"
  }, [currentPath])

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
