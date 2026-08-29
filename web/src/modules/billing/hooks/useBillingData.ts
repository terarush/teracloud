import { useSubscriptionsQuery, useInvoicesQuery } from "@/service/query/billing"

export function useBillingData() {
  const { data: subscriptions, isLoading: isSubsLoading } = useSubscriptionsQuery()
  const { data: invoices, isLoading: isInvoicesLoading } = useInvoicesQuery()

  return {
    subscriptions: subscriptions || [],
    invoices: invoices || [],
    isLoading: isSubsLoading || isInvoicesLoading,
  }
}
