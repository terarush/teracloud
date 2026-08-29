import { apiClient } from "@/lib/api-client"
import type { Plan } from "./plans"

export interface OrderItem {
  id: number
  order_id: number
  plan_id: number
  plan?: Plan
  subscription_id?: number
  custom_name?: string
  duration_months: number
  unit_price: number
  subtotal: number
  provisioning_status: "pending" | "provisioning" | "completed" | "failed"
  error_message?: string
  created_at: string
}

export interface Order {
  id: number
  order_number: string
  user_id: number
  plan_id?: number
  subscription_id?: number
  order_type: string
  amount: number
  total_amount?: number
  currency: string
  status: "pending" | "awaiting_payment" | "paid" | "failed" | "expired"
  midtrans_order_id: string
  midtrans_payment_type?: string
  snap_token?: string
  snap_redirect_url?: string
  paid_at?: string
  expired_at?: string
  items?: OrderItem[]
  created_at: string
}

export const ordersApi = {
  createOrder: async (planId: number, customName?: string, durationMonths = 1): Promise<Order> => {
    const res = await apiClient.post<Order>("/orders", {
      plan_id: planId,
      custom_name: customName,
      duration_months: durationMonths,
    })
    return (res as any)?.data ?? res.data
  },

  checkoutCart: async (cartItemIds?: number[]): Promise<Order> => {
    const res = await apiClient.post<Order>("/orders/checkout", {
      cart_item_ids: cartItemIds,
    })
    return (res as any)?.data ?? res.data
  },

  getUserOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>("/orders")
    return (res as any)?.data ?? res.data ?? []
  },

  getOrderById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<Order>(`/orders/${id}`)
    return (res as any)?.data ?? res.data
  },

  getOrderStatus: async (orderIdOrNumber: string | number): Promise<Order> => {
    const res = await apiClient.get<Order>(`/orders/${orderIdOrNumber}/status`)
    return (res as any)?.data ?? res.data
  },

  getOrderStats: async (): Promise<any> => {
    const res = await apiClient.get<any>("/orders/stats")
    return (res as any)?.data ?? res.data ?? {}
  },

  simulatePayment: async (orderIdOrNumber: string | number): Promise<Order> => {
    const res = await apiClient.post<Order>(`/orders/${orderIdOrNumber}/pay`)
    return (res as any)?.data ?? res.data
  },
}
