import { AdminAuditView } from "../views/AdminAuditView"
import { Seo } from "@/components/seo"

export const AdminAudit = () => {
  return (
    <>
      <Seo title="Audit Log" path="/app/admin/audit" robots="noindex, nofollow" />
      <AdminAuditView />
    </>
  )
}
