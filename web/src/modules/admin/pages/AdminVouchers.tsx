import { AdminVouchersView } from "../views/AdminVouchersView"
import { Seo } from "@/components/seo"

export const AdminVouchers = () => {
  return (
    <>
      <Seo title="Voucher" path="/app/vouchers" robots="noindex, nofollow" />
      <AdminVouchersView />
    </>
  )
}
