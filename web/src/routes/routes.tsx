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
import { ProfilePage } from "@/modules/profile/pages/ProfilePage"
import { CartPage } from "@/modules/cart/pages/CartPage"
import { CheckoutPage } from "@/modules/orders/pages/CheckoutPage"
import { OrderStatusPage } from "@/modules/orders/pages/OrderStatusPage"
import { AdminDashboard } from "@/modules/admin/pages/AdminDashboard"
import { AdminPlans } from "@/modules/admin/pages/AdminPlans"
import { AdminOrders } from "@/modules/admin/pages/AdminOrders"
import { AdminContainers } from "@/modules/admin/pages/AdminContainers"
import { AdminAudit } from "@/modules/admin/pages/AdminAudit"
import { AdminVouchers } from "@/modules/admin/pages/AdminVouchers"

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

const appProfileRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/profile",
  component: ProfilePage,
})

const appCartRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/cart",
  component: CartPage,
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

// Checkout by plan slug — entry point untuk "Beli Langsung" dari pricing,
// tempat user menginput voucher sebelum order dibuat & sebelum bayar.
const appCheckoutByPlanRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/orders/checkout/plan/$slug",
  component: () => {
    const { slug } = appCheckoutByPlanRoute.useParams()
    return <CheckoutPage planSlug={slug} />
  },
})

const rootCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders/checkout/$orderId",
  component: () => {
    const { orderId } = rootCheckoutRoute.useParams()
    return <CheckoutPage orderId={Number(orderId)} />
  },
  beforeLoad: authMiddleware.requireAuth,
})

const appOrdersFinishRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/orders/finish",
  component: OrderStatusPage,
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

const appAdminContainersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/containers",
  component: AdminContainers,
})

const appAdminAuditRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/admin/audit",
  component: AdminAudit,
})

const appAdminVouchersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/vouchers",
  component: AdminVouchers,
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
  rootCheckoutRoute,
  appLayoutRoute.addChildren([
    appOverviewRoute,
    appContainersListRoute,
    appContainerDetailRoute,
    appBillingRoute,
    appProfileRoute,
    appCartRoute,
    appOrdersRoute,
    appCheckoutRoute,
    appCheckoutByPlanRoute,
    appOrdersFinishRoute,
    appConsoleRoute,
    appPlansManageRoute,
    appOrdersListRoute,
    appAdminContainersRoute,
    appAdminAuditRoute,
    appAdminVouchersRoute,
  ]),
])
