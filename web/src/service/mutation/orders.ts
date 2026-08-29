import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ordersApi } from "../api/orders"

export function useCreateOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planId: number) => ordersApi.createOrder(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
