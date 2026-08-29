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

// 3. Protected App Routes
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

export const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  googleCallbackRoute,
  authSetUsernameRoute,
  setUsernameRoute,
  appLayoutRoute.addChildren([
    appDashboardRoute,
  ]),
])
