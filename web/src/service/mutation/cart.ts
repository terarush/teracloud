import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cartApi } from "../api/cart"
import type { AddToCartPayload, UpdateCartPayload } from "../api/cart"
import { ordersApi } from "../api/orders"
import { CART_QUERY_KEY } from "../query/cart"

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartApi.addToCart(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (err) => {
      console.error("useAddToCartMutation error:", err)
    },
  })
}

export const useUpdateCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCartPayload }) =>
      cartApi.updateCartItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (err) => {
      console.error("useUpdateCartMutation error:", err)
    },
  })
}

export const useRemoveCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => cartApi.removeCartItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (err) => {
      console.error("useRemoveCartMutation error:", err)
    },
  })
}

export const useClearCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
    },
    onError: (err) => {
      console.error("useClearCartMutation error:", err)
    },
  })
}

export const useCheckoutCartMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ cartItemIds, voucherCode }: { cartItemIds?: number[]; voucherCode?: string } = {}) =>
      ordersApi.checkoutCart(cartItemIds, voucherCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: (err) => {
      console.error("useCheckoutCartMutation error:", err)
    },
  })
}
