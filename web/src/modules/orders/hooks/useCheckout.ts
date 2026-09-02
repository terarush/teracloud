import { useOrderQuery } from "@/service/query/orders"
import { usePlanBySlugQuery, usePlansQuery } from "@/service/query/plans"
import { useCreateOrderMutation } from "@/service/mutation/orders"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { tl } from "@/lib/i18n"

export function useCheckout(orderId?: number, planSlug?: string) {
  const navigate = useNavigate()
  const { data: order, isLoading: isOrderLoading, refetch: refetchOrder } = useOrderQuery(orderId || 0)
  const { data: plan, isLoading: isPlanLoading } = usePlanBySlugQuery(planSlug || "")
  const { data: plans } = usePlansQuery()
  const createOrderMutation = useCreateOrderMutation()

  const handleCreateOrder = async (targetPlanId: number, voucherCode?: string) => {
    try {
      const created = await createOrderMutation.mutateAsync({ planId: targetPlanId, voucherCode })
      toast.success(tl("hosting.toast.orderCreated"))
      navigate({ to: "/orders/checkout/$orderId", params: { orderId: String(created.id) } })
    } catch (err: any) {
      console.error("Failed to create order:", err)
      toast.error(err.response?.data?.message || err.message || tl("hosting.toast.orderCreateFailed"))
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
