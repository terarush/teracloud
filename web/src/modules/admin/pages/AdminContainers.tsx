import { AdminContainersView } from "../views/AdminContainersView"
import { Seo } from "@/components/seo"

export const AdminContainers = () => {
  return (
    <>
      <Seo title="Kelola Container" path="/app/admin/containers" robots="noindex, nofollow" />
      <AdminContainersView />
    </>
  )
}
