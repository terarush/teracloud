import { createRootRoute, createRoute, Outlet, redirect } from "@tanstack/react-router"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { authMiddleware } from "@/middleware/auth"

// Auth Pages
import LoginPage from "@/modules/auth/login"
import RegisterPage from "@/modules/auth/register"
import ForgotPasswordPage from "@/modules/auth/forgot-password"
import ResetPasswordPage from "@/modules/auth/reset-password"
import GoogleCallbackPage from "@/modules/auth/google-callback"
import SetUsernamePage from "@/modules/auth/set-username"

// Feature Pages
import HomePage from "@/modules/home/pages/HomePage"
import NotFound from "@/modules/error/not-found"
import { GlobalsAppLayout } from "@/modules/app/layouts/globalsAppLayout"
import { PricingPage } from "@/modules/pricing/pages/PricingPage"
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage"
import { ContainerDetailPage } from "@/modules/containers/pages/ContainerDetailPage"
import { TerminalPage } from "@/modules/containers/pages/TerminalPage"
import { BillingPage } from "@/modules/billing/pages/BillingPage"
import { CheckoutPage } from "@/modules/orders/pages/CheckoutPage"
import { AdminDashboard } from "@/modules/admin/pages/AdminDashboard"
import { AdminPlans } from "@/modules/admin/pages/AdminPlans"
import { AdminOrders } from "@/modules/admin/pages/AdminOrders"

import "../styles.css"
import { Toaster } from "@/components/ui/sonner"

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
  path: "/",
  component: HomePage,
})

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  component: PricingPage,
})

// 2. Auth Routes
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: authMiddleware.requireGuest,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
  beforeLoad: authMiddleware.requireGuest,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPasswordPage,
  beforeLoad: authMiddleware.requireGuest,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  component: ResetPasswordPage,
  beforeLoad: authMiddleware.requireGuest,
})

const googleCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/oauth2/google/callback",
  component: GoogleCallbackPage,
})

const authSetUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/set-username",
  component: SetUsernamePage,
  beforeLoad: authMiddleware.requireAuth,
})

const setUsernameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/set-username",
  beforeLoad: () => {
    throw redirect({ to: "/auth/set-username" as any })
  },
})

// 3. Legacy Redirects to /app/*
const legacyDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: () => {
    throw redirect({ to: "/app" as any })
  },
})

const legacyAppDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/dashboard",
  beforeLoad: () => {
    throw redirect({ to: "/app" as any })
  },
})

const legacyAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  beforeLoad: () => {
    throw redirect({ to: "/app/console" as any })
  },
})

// 4. Standalone Fullscreen Terminal (No Sidebar)
const appContainerTerminalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/containers/$id/terminal",
  component: () => {
    const { id } = appContainerTerminalRoute.useParams()
    return <TerminalPage containerId={Number(id)} />
  },
  beforeLoad: authMiddleware.requireAuth,
})

// 5. Protected App Layout Routes (/app/*)
const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: GlobalsAppLayout,
  beforeLoad: authMiddleware.requireAuth,
})

const appOverviewRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/",
  component: DashboardPage,
})

const appContainersListRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/containers",
  component: DashboardPage,
})

const appContainerDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/containers/$id",
  component: () => {
    const { id } = appContainerDetailRoute.useParams()
    return <ContainerDetailPage containerId={Number(id)} />
  },
})

const appBillingRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/billing",
  component: BillingPage,
})

const appOrdersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/orders",
  component: () => <CheckoutPage />,
})

const appCheckoutRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/orders/checkout/$orderId",
  component: () => {
    const { orderId } = appCheckoutRoute.useParams()
    return <CheckoutPage orderId={Number(orderId)} />
  },
})

const appConsoleRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/console",
  component: AdminDashboard,
})

const appPlansManageRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/plans",
  component: AdminPlans,
})

const appOrdersListRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/orders-list",
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
  legacyDashboardRoute,
  legacyAppDashboardRoute,
  legacyAdminRoute,
  appContainerTerminalRoute,
  appLayoutRoute.addChildren([
    appOverviewRoute,
    appContainersListRoute,
    appContainerDetailRoute,
    appBillingRoute,
    appOrdersRoute,
    appCheckoutRoute,
    appConsoleRoute,
    appPlansManageRoute,
    appOrdersListRoute,
  ]),
])
