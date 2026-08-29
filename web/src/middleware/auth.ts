import { redirect } from '@tanstack/react-router'
import Cookies from 'js-cookie'

export const authMiddleware = {
  hasToken: () => !!Cookies.get('accessToken'),
  requireAuth: () => {
    if (!Cookies.get('accessToken')) throw redirect({ to: '/login' as any })
  },
  requireGuest: () => {
    if (Cookies.get('accessToken')) throw redirect({ to: '/app' as any })
  },
  requireRole: (role: string) => () => {
    if (Cookies.get('user_role') !== role) throw redirect({ to: '/app' as any })
  }
}
