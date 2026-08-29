import { apiClient } from "@/lib/api-client"

export interface Subscription {
  id: number
  user_id: number
  plan_id: number
  container_id?: number
  status: "provisioning" | "active" | "grace_period" | "suspended" | "terminated"
  period_start: string
  period_end: string
  grace_period_end?: string
  auto_renew: boolean
  created_at: string
}

export interface InvoiceItem {
  description: string
  qty: number
  amount: number
}

export interface Invoice {
  id: number
  invoice_number: string
  user_id: number
  subscription_id?: number
  order_id?: number
  subtotal: number
  tax: number
  total: number
  currency: string
  status: string
  due_date: string
  paid_at?: string
  items?: InvoiceItem[]
  created_at: string
}

export const billingApi = {
  getSubscriptions: async (): Promise<Subscription[]> => {
    const res = await apiClient.get<Subscription[]>("/billing/subscriptions")
    return (res as any)?.data ?? res.data ?? []
  },

  getInvoices: async (): Promise<Invoice[]> => {
    const res = await apiClient.get<Invoice[]>("/billing/invoices")
    return (res as any)?.data ?? res.data ?? []
  },

  getInvoiceById: async (id: number): Promise<Invoice> => {
    const res = await apiClient.get<Invoice>(`/billing/invoices/${id}`)
    return (res as any)?.data ?? res.data
  },
}
