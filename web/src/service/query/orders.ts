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
