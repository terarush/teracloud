import { useQuery } from "@tanstack/react-query"
import { billingApi } from "../api/billing"

export function useSubscriptionsQuery() {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: () => billingApi.getSubscriptions(),
  })
}

export function useInvoicesQuery() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => billingApi.getInvoices(),
  })
}

export function useInvoiceQuery(id: number) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => billingApi.getInvoiceById(id),
    enabled: !!id && !isNaN(id),
  })
}
