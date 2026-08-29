import { useQuery } from "@tanstack/react-query"
import { adminApi } from "../api/admin"

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminApi.getStats(),
  })
}

export function useAdminAuditLogsQuery() {
  return useQuery({
    queryKey: ["admin", "audit-logs"],
    queryFn: () => adminApi.getAuditLogs(),
  })
}

export function useAdminContainersQuery() {
  return useQuery({
    queryKey: ["admin", "containers"],
    queryFn: () => adminApi.getAllContainers(),
  })
}

export function useAdminOrdersQuery() {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => adminApi.getAllOrders(),
  })
}

export function useAdminSubscriptionsQuery() {
  return useQuery({
    queryKey: ["admin", "subscriptions"],
    queryFn: () => adminApi.getAllSubscriptions(),
  })
}
