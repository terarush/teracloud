// Forwarding exports for backwards compatibility during migration
import { plansApi } from "./api/plans"
import { containersApi } from "./api/containers"
import { ordersApi } from "./api/orders"
import { billingApi } from "./api/billing"
import { adminApi } from "./api/admin"

export * from "./api/plans"
export * from "./api/containers"
export * from "./api/orders"
export * from "./api/billing"
export * from "./api/admin"

export const teracloudApi = {
  ...plansApi,
  ...containersApi,
  ...ordersApi,
  ...billingApi,
  ...adminApi,
}
