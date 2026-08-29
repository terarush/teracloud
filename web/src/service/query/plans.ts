import { useQuery } from "@tanstack/react-query"
import { plansApi } from "../api/plans"

export function usePlansQuery() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => plansApi.getPlans(),
  })
}

export function usePlanBySlugQuery(slug: string) {
  return useQuery({
    queryKey: ["plans", slug],
    queryFn: () => plansApi.getPlanBySlug(slug),
    enabled: !!slug,
  })
}

export function useAdminPlansQuery() {
  return useQuery({
    queryKey: ["admin", "plans"],
    queryFn: () => plansApi.adminGetPlans(),
  })
}
