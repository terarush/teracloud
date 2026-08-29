import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import { authMiddleware } from '@/middleware/auth'

import LoginPage from '@/modules/auth/login'
import RegisterPage from '@/modules/auth/register'
import ForgotPasswordPage from '@/modules/auth/forgot-password'
import ResetPasswordPage from '@/modules/auth/reset-password'
import GoogleCallbackPage from '@/modules/auth/google-callback'
import SetUsernamePage from '@/modules/auth/set-username'

import HomePage from '@/modules/home/index'
import NotFound from '@/modules/error/not-found'
import { GlobalsAppLayout } from '@/modules/app/layouts/globalsAppLayout'
import AppPage from '@/modules/app/index'
import { PricingPage } from '@/modules/pricing/PricingPage'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { ContainerDetailPage } from '@/modules/containers/ContainerDetailPage'
import { TerminalPage } from '@/modules/containers/TerminalPage'
import { BillingPage } from '@/modules/billing/BillingPage'
import { AdminDashboard } from '@/modules/admin/AdminDashboard'
import { AdminPlans } from '@/modules/admin/AdminPlans'
import { AdminOrders } from '@/modules/admin/AdminOrders'

import '../styles.css'
import { Toaster } from '@/components/ui/sonner'

export const rootRoute = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFound,
})

function RootComponent() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            <Outlet />
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

// 1. Public Routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
})

// 2. Guest-Only Auth Routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: authMiddleware.requireGuest,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  beforeLoad: authMiddleware.requireGuest,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
  beforeLoad: authMiddleware.requireGuest,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  component: ResetPasswordPage,
  beforeLoad: authMiddleware.requireGuest,
})

const googleCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/oauth2/google/callback',
  component: GoogleCallbackPage,
})

const authSetUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/set-username',
  component: SetUsernamePage,
  beforeLoad: authMiddleware.requireAuth,
})

const setUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/set-username',
  beforeLoad: () => {
    throw redirect({ to: '/auth/set-username' as any })
  },
})

// 3. Legacy redirect routes (old paths → new /app/* paths)
const legacyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard' as any })
  },
})

const legacyContainerDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/containers/$id',
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/app/dashboard/containers/${params.id}` as any })
  },
})

const legacyContainerTerminalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/containers/$id/terminal',
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/app/dashboard/containers/${params.id}/terminal` as any })
  },
})

const legacyBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard/billing',
  beforeLoad: () => {
    throw redirect({ to: '/app/dashboard/billing' as any })
  },
})

const legacyAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    throw redirect({ to: '/app/admin' as any })
  },
})

const legacyAdminPlansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/plans',
  beforeLoad: () => {
    throw redirect({ to: '/app/admin/plans' as any })
  },
})

const legacyAdminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/orders',
  beforeLoad: () => {
    throw redirect({ to: '/app/admin/orders' as any })
  },
})

// 4. Terminal — standalone full-screen (NOT inside sidebar layout)
const appContainerTerminalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app/dashboard/containers/$id/terminal',
  component: () => {
    const { id } = appContainerTerminalRoute.useParams()
    return <TerminalPage containerId={Number(id)} />
  },
  beforeLoad: authMiddleware.requireAuth,
})

// 5. Protected App Routes (all inside sidebar layout)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app',
  component: GlobalsAppLayout,
  beforeLoad: authMiddleware.requireAuth,
})

const appDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  component: AppPage,
})

const appUserDashboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const appContainerDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard/containers/$id',
  component: () => {
    const { id } = appContainerDetailRoute.useParams()
    return <ContainerDetailPage containerId={Number(id)} />
  },
})

const appBillingRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/dashboard/billing',
  component: BillingPage,
})

const appAdminRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin',
  component: AdminDashboard,
})

const appAdminPlansRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin/plans',
  component: AdminPlans,
})

const appAdminOrdersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin/orders',
  component: AdminOrders,
})

export const routeTree = rootRoute.addChildren([
  homeRoute,
  pricingRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  googleCallbackRoute,
  authSetUsernameRoute,
  setUsernameRoute,
  // Legacy redirects
  legacyDashboardRoute,
  legacyContainerDetailRoute,
  legacyContainerTerminalRoute,
  legacyBillingRoute,
  legacyAdminRoute,
  legacyAdminPlansRoute,
  legacyAdminOrdersRoute,
  // Terminal standalone (full-screen, no sidebar)
  appContainerTerminalRoute,
  // Main app layout with sidebar
  appLayoutRoute.addChildren([
    appDashboardRoute,
    appUserDashboardRoute,
    appContainerDetailRoute,
    appBillingRoute,
    appAdminRoute,
    appAdminPlansRoute,
    appAdminOrdersRoute,
  ]),
])
