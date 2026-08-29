import { useContainersQuery } from "@/service/query/containers"
import { useSubscriptionsQuery } from "@/service/query/billing"

export function useDashboard() {
  const { data: containers, isLoading: isContainersLoading } = useContainersQuery()
  const { data: subscriptions, isLoading: isSubscriptionsLoading } = useSubscriptionsQuery()

  const safeContainers = containers || []
  const safeSubscriptions = subscriptions || []

  const runningContainers = safeContainers.filter((c) => c.status === "running").length

  return {
    containers: safeContainers,
    subscriptions: safeSubscriptions,
    runningContainers,
    isLoading: isContainersLoading || isSubscriptionsLoading,
  }
}
