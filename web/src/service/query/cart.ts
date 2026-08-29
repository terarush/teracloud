import { useQuery } from "@tanstack/react-query"
import { cartApi } from "../api/cart"

export const CART_QUERY_KEY = ["cart"] as const

export const useCartQuery = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: () => cartApi.getCart(),
    staleTime: 1000 * 30, // 30 seconds
    ...options,
  })
}
