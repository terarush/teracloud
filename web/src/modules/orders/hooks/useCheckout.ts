import { useOrderQuery } from "@/service/query/orders"
import { usePlanBySlugQuery, usePlansQuery } from "@/service/query/plans"
import { useCreateOrderMutation } from "@/service/mutation/orders"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

export function useCheckout(orderId?: number, planSlug?: string) {
  const navigate = useNavigate()
  const { data: order, isLoading: isOrderLoading, refetch: refetchOrder } = useOrderQuery(orderId || 0)
  const { data: plan, isLoading: isPlanLoading } = usePlanBySlugQuery(planSlug || "")
  const { data: plans } = usePlansQuery()
  const createOrderMutation = useCreateOrderMutation()

  const handleCreateOrder = async (targetPlanId: number) => {
    try {
      const created = await createOrderMutation.mutateAsync(targetPlanId)
      toast.success("Order berhasil dibuat!")
      if (created.snap_redirect_url) {
        window.location.href = created.snap_redirect_url
      } else {
        navigate({ to: "/app/orders" })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memproses pesanan")
    }
  }

  const selectedPlan = plan || plans?.find((p) => p.id === order?.plan_id)

  return {
    order,
    plan: selectedPlan,
    isLoading: (!!orderId && isOrderLoading) || (!!planSlug && isPlanLoading),
    handleCreateOrder,
    isCreating: createOrderMutation.isPending,
    refetchOrder,
  }
}
