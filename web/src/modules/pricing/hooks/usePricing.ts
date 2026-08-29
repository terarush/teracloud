import { usePlansQuery } from "@/service/query/plans"
import { useCreateOrderMutation } from "@/service/mutation/orders"
import type { Plan } from "@/service/api/plans"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

export function usePricing() {
  const navigate = useNavigate()
  const { data: plans, isLoading, error, refetch } = usePlansQuery()
  const createOrderMutation = useCreateOrderMutation()

  const handleSelectPlan = async (plan: Plan) => {
    try {
      const order = await createOrderMutation.mutateAsync(plan.id)
      if (order.snap_redirect_url) {
        window.location.href = order.snap_redirect_url
      } else {
        navigate({ to: "/app/orders" })
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat pesanan paket hosting")
    }
  }

  return {
    plans: plans || [],
    isLoading,
    error,
    refetch,
    handleSelectPlan,
    isCreatingOrder: createOrderMutation.isPending,
  }
}
