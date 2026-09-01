import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi } from "../api/orders"

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ planId, voucherCode }: { planId: number; voucherCode?: string }) =>
      ordersApi.createOrder(planId, undefined, 1, voucherCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
