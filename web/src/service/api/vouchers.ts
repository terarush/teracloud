import { apiClient } from "@/lib/api-client"

export interface VoucherQuoteItem {
  plan_id: number
  unit_price: number
  duration_months: number
  subtotal: number
}

export interface VoucherQuote {
  valid: boolean
  code: string
  name?: string
  discount_type?: string
  discount_value?: number
  total_subtotal: number
  total_discount: number
  total_after: number
  discount_items?: number[]
  error_code?: string
  error_message?: string
}

export const vouchersApi = {
  validate: async (voucherCode: string, items: VoucherQuoteItem[]): Promise<VoucherQuote> => {
    const res = await apiClient.post<VoucherQuote>("/vouchers/validate", {
      voucher_code: voucherCode,
      items,
    })
    return (res as any)?.data ?? res.data
  },
}
