import { apiClient } from "@/lib/api-client"

export interface PortConfigItem {
  container_port: number
  protocol?: string
  name?: string
  description?: string
  is_primary?: boolean
}

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
  port_config?: PortConfigItem[]
  environment_template?: Record<string, any>
  command?: string
  entrypoint?: string
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
  port_config?: PortConfigItem[]
  environment_template?: Record<string, any>
  command?: string
  entrypoint?: string
  icon?: string
  max_per_user?: number
}

export interface UpdatePlanRequest extends Partial<CreatePlanRequest> {}

export const plansApi = {
  // Public
  getPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get<Plan[]>("/plans")
    return (res as any)?.data ?? res.data ?? []
  },

  getPlanBySlug: async (slug: string): Promise<Plan> => {
    const res = await apiClient.get<Plan>(`/plans/${slug}`)
    return (res as any)?.data ?? res.data
  },

  // Admin / CRUD
  adminGetPlans: async (): Promise<Plan[]> => {
    const res = await apiClient.get<Plan[]>("/plans")
    return (res as any)?.data ?? res.data ?? []
  },

  adminCreatePlan: async (data: CreatePlanRequest): Promise<Plan> => {
    const res = await apiClient.post<Plan>("/plans", data)
    return (res as any)?.data ?? res.data
  },

  adminUpdatePlan: async (id: number, data: UpdatePlanRequest): Promise<Plan> => {
    const res = await apiClient.put<Plan>(`/plans/${id}`, data)
    return (res as any)?.data ?? res.data
  },

  adminDeletePlan: async (id: number): Promise<void> => {
    await apiClient.delete(`/plans/${id}`)
  },

  adminTogglePlan: async (id: number): Promise<Plan> => {
    const res = await apiClient.patch<Plan>(`/plans/${id}/toggle`)
    return (res as any)?.data ?? res.data
  },
}
