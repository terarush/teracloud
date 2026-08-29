import { useMutation, useQueryClient } from "@tanstack/react-query"
import { plansApi   } from "../api/plans"
import type {CreatePlanRequest, UpdatePlanRequest} from "../api/plans";

export function useCreatePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlanRequest) => plansApi.adminCreatePlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    },
  })
}

export function useUpdatePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePlanRequest }) =>
      plansApi.adminUpdatePlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    },
  })
}

export function useDeletePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => plansApi.adminDeletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    },
  })
}

export function useTogglePlanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => plansApi.adminTogglePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] })
      queryClient.invalidateQueries({ queryKey: ["admin", "plans"] })
    },
  })
}
