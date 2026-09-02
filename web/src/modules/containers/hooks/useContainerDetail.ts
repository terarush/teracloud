import {
  useContainerQuery,
  useContainerEventsQuery,
  useContainerStatsQuery,
} from "@/service/query/containers"
import {
  useStartContainerMutation,
  useStopContainerMutation,
  useRestartContainerMutation,
  useResetContainerMutation,
  useDeleteContainerMutation,
} from "@/service/mutation/containers"
import { toast } from "sonner"
import { useNavigate } from "@tanstack/react-router"
import { tl } from "@/lib/i18n"

export function useContainerDetail(containerId: number) {
  const navigate = useNavigate()
  const { data: container, isLoading: isContainerLoading, refetch } = useContainerQuery(containerId)
  const { data: events, isLoading: isEventsLoading } = useContainerEventsQuery(containerId)
  const { data: stats } = useContainerStatsQuery(containerId)

  const startMutation = useStartContainerMutation()
  const stopMutation = useStopContainerMutation()
  const restartMutation = useRestartContainerMutation()
  const resetMutation = useResetContainerMutation()
  const deleteMutation = useDeleteContainerMutation()

  const isStarting = startMutation.isPending
  const isStopping = stopMutation.isPending
  const isRestarting = restartMutation.isPending
  const isResetting = resetMutation.isPending
  const isDeleting = deleteMutation.isPending

  const isPending = isStarting || isStopping || isRestarting || isResetting || isDeleting

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(containerId)
      toast.success(tl("hosting.toast.containerStarted"))
    } catch (err: any) {
      console.error("Failed to start container:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.toast.containerStartFailed"))
    }
  }

  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync(containerId)
      toast.success(tl("hosting.toast.containerStopped"))
    } catch (err: any) {
      console.error("Failed to stop container:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.toast.containerStopFailed"))
    }
  }

  const handleRestart = async () => {
    try {
      await restartMutation.mutateAsync(containerId)
      toast.success(tl("hosting.toast.containerRestarted"))
    } catch (err: any) {
      console.error("Failed to restart container:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.toast.containerRestartFailed"))
    }
  }

  const handleReset = async (mode: "soft" | "hard" = "soft") => {
    const modeLabel =
      mode === "hard"
        ? tl("hosting.toast.hardResetMode")
        : tl("hosting.toast.softResetMode")
    if (!confirm(tl("hosting.toast.confirmReset", { mode: modeLabel }))) {
      return
    }
    try {
      await resetMutation.mutateAsync({ id: containerId, mode })
      toast.success(tl("hosting.toast.containerReset"))
    } catch (err: any) {
      console.error("Failed to reset container:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.toast.containerResetFailed"))
    }
  }

  const handleDelete = async () => {
    if (!confirm(tl("hosting.toast.confirmDeleteContainer"))) return
    try {
      await deleteMutation.mutateAsync(containerId)
      toast.success(tl("hosting.toast.containerDeleted"))
      navigate({ to: "/app" })
    } catch (err: any) {
      console.error("Failed to delete container:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.toast.containerDeleteFailed"))
    }
  }

  return {
    container,
    events: events || [],
    stats: stats || [],
    isLoading: isContainerLoading || isEventsLoading,
    isPending,
    isStarting,
    isStopping,
    isRestarting,
    isResetting,
    isDeleting,
    handleStart,
    handleStop,
    handleRestart,
    handleReset,
    handleDelete,
    refetch,
  }
}
