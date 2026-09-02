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
    onError: (err) => {
      console.error("useStartContainerMutation error:", err)
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
    onError: (err) => {
      console.error("useStopContainerMutation error:", err)
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
    onError: (err) => {
      console.error("useRestartContainerMutation error:", err)
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
    onError: (err) => {
      console.error("useRebootContainerMutation error:", err)
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
    onError: (err) => {
      console.error("useResetContainerMutation error:", err)
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
    onError: (err) => {
      console.error("useDeleteContainerMutation error:", err)
    },
  })
}
