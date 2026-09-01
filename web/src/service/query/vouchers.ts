import { useQuery } from "@tanstack/react-query"
import { vouchersApi } from "../api/vouchers"

export function useAdminVouchersQuery() {
  return useQuery({
    queryKey: ["admin", "vouchers"],
    queryFn: () => vouchersApi.adminListVouchers(),
  })
}
