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
    const res = await apiClient.get<{ data: AdminStats }>("/admin/stats")
    return res.data.data
  },

  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<{ data: AuditLog[] }>("/admin/audit-logs")
    return res.data.data || []
  },

  getAllContainers: async (): Promise<Container[]> => {
    const res = await apiClient.get<{ data: Container[] }>("/admin/containers")
    return res.data.data || []
  },

  getAllOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<{ data: Order[] }>("/admin/orders")
    return res.data.data || []
  },

  getAllSubscriptions: async (): Promise<Subscription[]> => {
    const res = await apiClient.get<{ data: Subscription[] }>("/admin/subscriptions")
    return res.data.data || []
  },
}
