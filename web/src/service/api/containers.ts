import { apiClient } from "@/lib/api-client"

export interface Container {
  id: number
  user_id: number
  subscription_id: number
  plan_id: number
  container_name: string
  hostname: string
  image_name: string
  image_tag: string
  status: "creating" | "running" | "stopped" | "suspended" | "error" | "deleted"
  cpu_limit: number
  memory_limit: number
  disk_limit: number
  port_mappings?: Record<string, number>
  assigned_ports?: Record<string, number>
  last_started_at?: string
  last_stopped_at?: string
  error_message?: string
  created_at: string
}

export interface ContainerEvent {
  id: number
  container_id: number
  user_id: number
  event_type: string
  description: string
  metadata?: Record<string, any>
  ip_address?: string
  created_at: string
}

export interface ContainerStats {
  id: number
  container_id: number
  cpu_usage_percent: number
  memory_usage_mb: number
  memory_limit_mb: number
  network_rx_bytes: number
  network_tx_bytes: number
  disk_usage_bytes: number
  recorded_at: string
}

export const containersApi = {
  getUserContainers: async (): Promise<Container[]> => {
    const res = await apiClient.get<{ data: Container[] }>("/containers")
    return res.data.data || []
  },

  getContainerById: async (id: number): Promise<Container> => {
    const res = await apiClient.get<{ data: Container }>(`/containers/${id}`)
    return res.data.data
  },

  startContainer: async (id: number): Promise<void> => {
    await apiClient.post(`/containers/${id}/start`)
  },

  stopContainer: async (id: number): Promise<void> => {
    await apiClient.post(`/containers/${id}/stop`)
  },

  restartContainer: async (id: number): Promise<void> => {
    await apiClient.post(`/containers/${id}/restart`)
  },

  rebootContainer: async (id: number): Promise<void> => {
    await apiClient.post(`/containers/${id}/reboot`)
  },

  resetContainer: async (id: number, mode: "soft" | "hard" = "soft"): Promise<void> => {
    await apiClient.post(`/containers/${id}/reset`, { mode })
  },

  deleteContainer: async (id: number): Promise<void> => {
    await apiClient.delete(`/containers/${id}`)
  },

  getContainerEvents: async (id: number): Promise<ContainerEvent[]> => {
    const res = await apiClient.get<{ data: ContainerEvent[] }>(`/containers/${id}/events`)
    return res.data.data || []
  },

  getContainerStats: async (id: number): Promise<ContainerStats[]> => {
    const res = await apiClient.get<{ data: ContainerStats[] }>(`/containers/${id}/stats`)
    return res.data.data || []
  },
}
