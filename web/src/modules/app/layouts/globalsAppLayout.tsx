import { useMemo, useRef } from 'react'
import { Outlet, useRouterState, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useAuth } from '@/contexts/auth-context'
import { useCartQuery } from '@/service/query/cart'
import { getSidebarContentList } from '@/globals/content/app-sidebar'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'

const SIDEBAR_WIDTH = '16rem'
const SIDEBAR_WIDTH_ICON = '3rem'

function AppHeader({ pageTitle }: { pageTitle: string }) {
  const { state, isMobile } = useSidebar()
  const { user } = useAuth()
  const { data: cart } = useCartQuery()
  const navigate = useNavigate()

  const cartItemCount = cart ? (cart.total_items || cart.items.length || 0) : 0

  const leftOffset = isMobile
    ? '0px'
    : state === 'collapsed'
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

      <div className="flex items-center gap-3">
        {/* Cart Icon in Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: '/app/cart' as any })}
          className="relative h-8 w-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
          title="Keranjang Belanja"
        >
          <ShoppingCart className="size-4" />
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {cartItemCount}
            </span>
          )}
        </Button>

        <div className="h-4 w-px bg-border/60" />

        <div className="flex items-center gap-3">
          <div className="flex-col text-right hidden sm:flex">
            <span className="text-xs font-bold text-foreground">
              {user ? `${user.first_name} ${user.last_name || ''}`.trim() : 'User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email || ''}
            </span>
          </div>
          <UserAvatar
            user={user}
            className="h-8 w-8 ring-2 ring-primary/10"
          />
        </div>
      </div>
    </header>
  )
}

export function GlobalsAppLayout() {
  const route = useRouterState()
  const currentPath = route.location.pathname
  const mainRef = useRef<HTMLElement>(null)
  const { t, i18n } = useTranslation()

  const sidebarList = useMemo(
    () => getSidebarContentList(t),
    [i18n.language, t],
  )

  const pageTitle = useMemo(() => {
    for (const group of sidebarList) {
      const matched = group.items.find((item) => item.href === currentPath)
      if (matched) return matched.title
    }
    return t('hosting.dashboard', 'Dashboard')
  }, [currentPath, sidebarList, t])

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AppHeader pageTitle={pageTitle} />

          {/* Spacer for fixed header */}
          <div className="h-14 shrink-0" />

          <main
            ref={mainRef}
            className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 min-w-0"
          >
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
