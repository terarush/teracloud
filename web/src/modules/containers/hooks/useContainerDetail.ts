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

  const isPending =
    startMutation.isPending ||
    stopMutation.isPending ||
    restartMutation.isPending ||
    resetMutation.isPending ||
    deleteMutation.isPending

  const handleStart = async () => {
    try {
      await startMutation.mutateAsync(containerId)
      toast.success("Container berhasil distart")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memulai container")
    }
  }

  const handleStop = async () => {
    try {
      await stopMutation.mutateAsync(containerId)
      toast.success("Container berhasil dihentikan")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghentikan container")
    }
  }

  const handleRestart = async () => {
    try {
      await restartMutation.mutateAsync(containerId)
      toast.success("Container berhasil direstart")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal me-restart container")
    }
  }

  const handleReset = async (mode: "soft" | "hard" = "soft") => {
    try {
      await resetMutation.mutateAsync({ id: containerId, mode })
      toast.success("Container berhasil direset")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal me-reset container")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus container ini dan semua file di dalamnya?")) return
    try {
      await deleteMutation.mutateAsync(containerId)
      toast.success("Container berhasil dihapus")
      navigate({ to: "/app" })
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus container")
    }
  }

  return {
    container,
    events: events || [],
    stats: stats || [],
    isLoading: isContainerLoading || isEventsLoading,
    isPending,
    handleStart,
    handleStop,
    handleRestart,
    handleReset,
    handleDelete,
    refetch,
  }
}
