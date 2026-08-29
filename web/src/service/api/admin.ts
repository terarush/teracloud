import { apiClient } from "@/lib/api-client"
import type { Container } from "./containers"
import type { Order } from "./orders"
import type { Subscription } from "./billing"

export interface AdminStats {
  total_revenue: number
  active_containers: number
  total_orders: number
  total_plans: number
  total_users?: number
}

export interface AuditLog {
  id: number
  user_id?: number
  action: string
  entity: string
  entity_id: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  created_at: string
}

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const res = await apiClient.get<AdminStats>("/stats")
    return (
      (res as any)?.data ??
      res.data ?? {
        total_revenue: 0,
        active_containers: 0,
        total_orders: 0,
        total_plans: 0,
        total_users: 0,
      }
    )
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>("/audit-logs")
    return (res as any)?.data ?? res.data ?? []
  },

  getAllContainers: async (): Promise<Container[]> => {
    const res = await apiClient.get<Container[]>("/containers/all")
    return (res as any)?.data ?? res.data ?? []
  },

  getAllOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>("/orders")
    return (res as any)?.data ?? res.data ?? []
  },

  getAllSubscriptions: async (): Promise<Subscription[]> => {
    const res = await apiClient.get<Subscription[]>("/billing/subscriptions")
    return (res as any)?.data ?? res.data ?? []
  },

  forceDeleteContainer: async (id: number): Promise<void> => {
    await apiClient.delete(`/containers/${id}/force`)
  },

  adminRestartContainer: async (id: number): Promise<void> => {
    await apiClient.post(`/containers/${id}/admin-restart`, {})
  },
}
