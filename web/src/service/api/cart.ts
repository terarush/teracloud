import { apiClient } from "@/lib/api-client"
import type { Plan } from "./plans"

export interface CartItem {
  id: number
  user_id: number
  plan_id: number
  plan?: Plan
  custom_name?: string
  duration_months: number
  monthly_price: number
  subtotal: number
  environment_config?: any
  created_at: string
  updated_at: string
}

export interface CartSummary {
  items: CartItem[]
  total_items: number
  total_amount: number
}

export interface AddToCartPayload {
  plan_id: number
  custom_name?: string
  duration_months: number
  environment_config?: any
}

export interface UpdateCartPayload {
  custom_name?: string
  duration_months?: number
  environment_config?: any
}

export const cartApi = {
  getCart: async (): Promise<CartSummary> => {
    const res = await apiClient.get<CartSummary>("/cart")
    return (res as any)?.data ?? res.data ?? { items: [], total_items: 0, total_amount: 0 }
  },

  addToCart: async (payload: AddToCartPayload): Promise<CartItem> => {
    const res = await apiClient.post<CartItem>("/cart", payload)
    return (res as any)?.data ?? res.data
  },

  updateCartItem: async (id: number, payload: UpdateCartPayload): Promise<CartItem> => {
    const res = await apiClient.put<CartItem>(`/cart/${id}`, payload)
    return (res as any)?.data ?? res.data
  },

  removeCartItem: async (id: number): Promise<void> => {
    await apiClient.delete(`/cart/${id}`)
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete("/cart")
  },
}
