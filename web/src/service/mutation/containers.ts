import { useMutation, useQueryClient } from "@tanstack/react-query"
import { containersApi } from "../api/containers"

export function useStartContainerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => containersApi.startContainer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] })
      queryClient.invalidateQueries({ queryKey: ["containers", id] })
    },
  })
}

export function useStopContainerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => containersApi.stopContainer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] })
      queryClient.invalidateQueries({ queryKey: ["containers", id] })
    },
  })
}

export function useRestartContainerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => containersApi.restartContainer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] })
      queryClient.invalidateQueries({ queryKey: ["containers", id] })
    },
  })
}

export function useRebootContainerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => containersApi.rebootContainer(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] })
      queryClient.invalidateQueries({ queryKey: ["containers", id] })
    },
  })
}

export function useResetContainerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, mode }: { id: number; mode?: "soft" | "hard" }) =>
      containersApi.resetContainer(id, mode),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["containers"] })
      queryClient.invalidateQueries({ queryKey: ["containers", id] })
    },
  })
}

export function useDeleteContainerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => containersApi.deleteContainer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["containers"] })
    },
  })
}
