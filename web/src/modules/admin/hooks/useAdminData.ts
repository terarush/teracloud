import { useAdminStatsQuery, useAdminAuditLogsQuery, useAdminContainersQuery, useAdminOrdersQuery } from "@/service/query/admin"
import { useAdminPlansQuery } from "@/service/query/plans"
import { useCreatePlanMutation, useUpdatePlanMutation, useDeletePlanMutation, useTogglePlanMutation } from "@/service/mutation/plans"
import { toast } from "sonner"
import { tl } from "@/lib/i18n"
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
      toast.success(tl("hosting.plan.toastCreated"))
    } catch (err: any) {
      console.error("Failed to create plan:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.plan.toastCreateFailed"))
    }
  }

  const handleUpdatePlan = async (id: number, data: CreatePlanRequest) => {
    try {
      await updatePlanMutation.mutateAsync({ id, data })
      toast.success(tl("hosting.plan.toastUpdated"))
    } catch (err: any) {
      console.error("Failed to update plan:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.plan.toastUpdateFailed"))
    }
  }

  const handleDeletePlan = async (id: number) => {
    if (!confirm(tl("hosting.plan.confirmDelete"))) return
    try {
      await deletePlanMutation.mutateAsync(id)
      toast.success(tl("hosting.plan.toastDeleted"))
    } catch (err: any) {
      console.error("Failed to delete plan:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.plan.toastDeleteFailed"))
    }
  }

  const handleTogglePlan = async (id: number) => {
    try {
      await togglePlanMutation.mutateAsync(id)
      toast.success(tl("hosting.plan.toastToggled"))
    } catch (err: any) {
      console.error("Failed to toggle plan:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.plan.toastToggleFailed"))
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
