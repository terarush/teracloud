import { useMutation, useQueryClient } from "@tanstack/react-query"
import { vouchersApi } from "../api/vouchers"
import type { CreateVoucherRequest, UpdateVoucherRequest } from "../api/vouchers"

export function useCreateVoucherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVoucherRequest) => vouchersApi.adminCreateVoucher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] })
    },
    onError: (err) => {
      console.error("useCreateVoucherMutation error:", err)
    },
  })
}

export function useUpdateVoucherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVoucherRequest }) =>
      vouchersApi.adminUpdateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] })
    },
    onError: (err) => {
      console.error("useUpdateVoucherMutation error:", err)
    },
  })
}

export function useDeleteVoucherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vouchersApi.adminDeleteVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] })
    },
    onError: (err) => {
      console.error("useDeleteVoucherMutation error:", err)
    },
  })
}

export function useToggleVoucherMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => vouchersApi.adminToggleVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] })
    },
    onError: (err) => {
      console.error("useToggleVoucherMutation error:", err)
    },
  })
}
