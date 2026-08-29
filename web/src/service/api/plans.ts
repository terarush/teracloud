import { apiClient } from "@/lib/api-client"

export interface Plan {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  image_name: string
  image_tag: string
  cpu_limit: number
  memory_limit: number
  disk_limit: number
  bandwidth_limit?: number
  price_monthly: number
  is_active: boolean
  features: string[]
  icon?: string
  max_per_user: number
  created_at?: string
  updated_at?: string
}

export interface CreatePlanRequest {
  name: string
  slug: string
  description?: string
  short_description?: string
  image_name: string
  image_tag: string
  cpu_limit: number
  memory_limit: number
  disk_limit: number
  bandwidth_limit?: number
  price_monthly: number
  is_active?: boolean
  features?: string[]
  icon?: string
  max_per_user?: number
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export const plansApi = {
  // Public
  getPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get<{ data: Plan[] }>("/plans")
    return res.data.data || []
  },

  getPlanBySlug: async (slug: string): Promise<Plan> => {
    const res = await apiClient.get<{ data: Plan }>(`/plans/${slug}`)
    return res.data.data
  },

  // Admin
  adminGetPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get<{ data: Plan[] }>("/admin/plans")
    return res.data.data || []
  },

  adminCreatePlan: async (data: CreatePlanRequest): Promise<Plan> => {
    const res = await apiClient.post<{ data: Plan }>("/admin/plans", data)
    return res.data.data
  },

  adminUpdatePlan: async (id: number, data: UpdatePlanRequest): Promise<Plan> => {
    const res = await apiClient.put<{ data: Plan }>(`/admin/plans/${id}`, data)
    return res.data.data
  },

  adminDeletePlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/plans/${id}`)
  },

  adminTogglePlan: async (id: number): Promise<Plan> => {
    const res = await apiClient.patch<{ data: Plan }>(`/admin/plans/${id}/toggle`)
    return res.data.data
  },
}
