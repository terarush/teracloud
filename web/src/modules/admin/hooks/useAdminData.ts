import { useAdminStatsQuery, useAdminAuditLogsQuery, useAdminContainersQuery, useAdminOrdersQuery } from "@/service/query/admin"
import { useAdminPlansQuery } from "@/service/query/plans"
import { useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation, useTogglePlanMutation } from "@/service/mutation/plans"
import { toast } from "sonner"
import type { CreatePlanRequest } from "@/service/api/plans"

export function useAdminData() {
  const { data: stats, isLoading: isStatsLoading } = useAdminStatsQuery()
  const { data: plans, isLoading: isPlansLoading } = useAdminPlansQuery()
  const { data: containers, isLoading: isContainersLoading } = useAdminContainersQuery()
  const { data: orders, isLoading: isOrdersLoading } = useAdminOrdersQuery()
  const { data: auditLogs, isLoading: isAuditLoading } = useAdminAuditLogsQuery()

  const createPlanMutation = useCreatePlanMutation()
  const updatePlanMutation = useUpdatePlanMutation()
  const deletePlanMutation = useDeletePlanMutation()
  const togglePlanMutation = useTogglePlanMutation()

  const handleCreatePlan = async (data: CreatePlanRequest) => {
    try {
      await createPlanMutation.mutateAsync(data)
      toast.success("Paket hosting berhasil ditambahkan")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat paket")
    }
  }

  const handleUpdatePlan = async (id: number, data: CreatePlanRequest) => {
    try {
      await updatePlanMutation.mutateAsync({ id, data })
      toast.success("Paket hosting berhasil diupdate")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengupdate paket")
    }
  }

  const handleDeletePlan = async (id: number) => {
    if (!confirm("Yakin ingin menghapus paket hosting ini?")) return
    try {
      await deletePlanMutation.mutateAsync(id)
      toast.success("Paket hosting berhasil dihapus")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghapus paket")
    }
  }

  const handleTogglePlan = async (id: number) => {
    try {
      await togglePlanMutation.mutateAsync(id)
      toast.success("Status paket hosting berhasil diubah")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengubah status paket")
    }
  }

  return {
    stats,
    plans: plans || [],
    containers: containers || [],
    orders: orders || [],
    auditLogs: auditLogs || [],
    isLoading: isStatsLoading || isPlansLoading || isContainersLoading || isOrdersLoading || isAuditLoading,
    handleCreatePlan,
    handleUpdatePlan,
    handleDeletePlan,
    handleTogglePlan,
    isPlanMutating: createPlanMutation.isPending || updatePlanMutation.isPending,
  }
}
