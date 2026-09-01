import { apiClient } from "@/lib/api-client"

export interface VoucherPlanRef {
  id: number
  name: string
  slug: string
}

export interface Voucher {
  id: number
  code: string
  name: string
  description: string
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  min_order_amount: number
  max_discount_amount?: number | null
  applies_to: "all" | "specific_plans"
  total_usage_limit?: number | null
  per_user_usage_limit?: number | null
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  plans?: VoucherPlanRef[]
  created_at: string
  updated_at: string
}

export interface CreateVoucherRequest {
  code: string
  name?: string
  description?: string
  discount_type: "percentage" | "fixed_amount"
  discount_value: number
  min_order_amount?: number
  max_discount_amount?: number | null
  applies_to?: "all" | "specific_plans"
  total_usage_limit?: number | null
  per_user_usage_limit?: number | null
  start_at?: string | null
  end_at?: string | null
  is_active?: boolean
  plan_ids?: number[]
}

export interface UpdateVoucherRequest extends Partial<CreateVoucherRequest> {}

export const vouchersApi = {
  adminListVouchers: async (): Promise<Voucher[]> => {
    const res = await apiClient.get<Voucher[]>("/vouchers")
    return (res as any)?.data ?? res.data ?? []
  },

  adminGetVoucher: async (id: number): Promise<Voucher> => {
    const res = await apiClient.get<Voucher>(`/vouchers/${id}`)
    return (res as any)?.data ?? res.data
  },

  adminCreateVoucher: async (data: CreateVoucherRequest): Promise<Voucher> => {
    const res = await apiClient.post<Voucher>("/vouchers", data)
    return (res as any)?.data ?? res.data
  },

  adminUpdateVoucher: async (id: number, data: UpdateVoucherRequest): Promise<Voucher> => {
    const res = await apiClient.put<Voucher>(`/vouchers/${id}`, data)
    return (res as any)?.data ?? res.data
  },

  adminDeleteVoucher: async (id: number): Promise<void> => {
    await apiClient.delete(`/vouchers/${id}`)
  },

  adminToggleVoucher: async (id: number): Promise<Voucher> => {
    const res = await apiClient.patch<Voucher>(`/vouchers/${id}/toggle`)
    return (res as any)?.data ?? res.data
  },
}
