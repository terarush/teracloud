import { usePlansQuery } from "@/service/query/plans"
import type { Plan } from "@/service/api/plans"
import { useNavigate } from "@tanstack/react-router"

export function usePlansOverview() {
  const navigate = useNavigate()
  const { data: plans, isLoading, error, refetch } = usePlansQuery()

  const handleSelectPlan = (plan: Plan) => {
    // "Beli Langsung" → arahkan ke checkout supaya user bisa input voucher dulu
    // sebelum order dibuat & sebelum bayar.
    navigate({ to: "/app/orders/checkout/plan/$slug", params: { slug: plan.slug } })
  }

  return {
    plans: plans || [],
    isLoading,
    error,
    refetch,
    handleSelectPlan,
  }
}