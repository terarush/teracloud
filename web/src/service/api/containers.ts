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
  tunnel_routes?: Array<{
    subdomain: string
    host_port: number
    name: string
    url: string
  }>
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
    const res = await apiClient.get<Container[]>("/containers")
    return (res as any)?.data ?? res.data ?? []
  },

  getContainerById: async (id: number): Promise<Container> => {
    const res = await apiClient.get<Container>(`/containers/${id}`)
    return (res as any)?.data ?? res.data
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
    const res = await apiClient.get<ContainerEvent[]>(`/containers/${id}/events`)
    return (res as any)?.data ?? res.data ?? []
  },

  getContainerStats: async (id: number): Promise<ContainerStats[]> => {
    const res = await apiClient.get<ContainerStats[]>(`/containers/${id}/stats`)
    return (res as any)?.data ?? res.data ?? []
  },
}
