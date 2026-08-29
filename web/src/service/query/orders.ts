import { useQuery } from "@tanstack/react-query"
import { ordersApi } from "../api/orders"

export function useOrdersQuery() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => ordersApi.getUserOrders(),
  })
}

export function useOrderQuery(id: number) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id && !isNaN(id),
  })
}

export function useOrderStatusQuery(orderIdOrNumber: string | number, enabled = true) {
  return useQuery({
    queryKey: ["order-status", orderIdOrNumber],
    queryFn: () => ordersApi.getOrderStatus(orderIdOrNumber),
    enabled: !!orderIdOrNumber && enabled,
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 2000
      // Keep polling if awaiting payment or if any item is still provisioning
      if (data.status === "awaiting_payment" || data.status === "pending") {
        return 2000
      }
      const hasPendingItems = data.items?.some(
        (it) => it.provisioning_status === "pending" || it.provisioning_status === "provisioning"
      )
      if (hasPendingItems) return 2500
      return false
    },
  })
}
