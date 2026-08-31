import { useQuery } from "@tanstack/react-query"
import { containersApi } from "../api/containers"

export function useContainersQuery() {
  return useQuery({
    queryKey: ["containers"],
    queryFn: () => containersApi.getUserContainers(),
  })
}

export function useContainerQuery(id: number) {
  return useQuery({
    queryKey: ["containers", id],
    queryFn: () => containersApi.getContainerById(id),
    enabled: !!id && !isNaN(id),
  })
}

export function useContainerEventsQuery(id: number) {
  return useQuery({
    queryKey: ["containers", id, "events"],
    queryFn: () => containersApi.getContainerEvents(id),
    enabled: !!id && !isNaN(id),
  })
}

export function useContainerStatsQuery(id: number) {
  return useQuery({
    queryKey: ["containers", id, "stats"],
    queryFn: () => containersApi.getContainerStats(id),
    enabled: !!id && !isNaN(id),
    refetchInterval: 5000,
  })
}

export function useContainerLogsQuery(id: number, enabled = true) {
  return useQuery({
    queryKey: ["containers", id, "logs"],
    queryFn: () => containersApi.getContainerLogs(id, 300),
    enabled: !!id && !isNaN(id) && enabled,
    refetchInterval: 3000,
  })
}
