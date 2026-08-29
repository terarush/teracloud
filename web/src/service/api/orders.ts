import { apiClient } from "@/lib/api-client"

export interface Order {
  id: number
  order_number: string
  user_id: number
  plan_id: number
  subscription_id?: number
  order_type: string
  amount: number
  currency: string
  status: "pending" | "awaiting_payment" | "paid" | "failed" | "expired"
  midtrans_order_id: string
  snap_token?: string
  snap_redirect_url?: string
  paid_at?: string
  expired_at?: string
  created_at: string
}

export const ordersApi = {
  createOrder: async (planId: number): Promise<Order> => {
    const res = await apiClient.post<{ data: Order }>("/orders", { plan_id: planId })
    return res.data.data
  },

  getUserOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<{ data: Order[] }>("/orders")
    return res.data.data || []
  },

  getOrderById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<{ data: Order }>(`/orders/${id}`)
    return res.data.data
  },
}
