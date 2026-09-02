import { AdminPlansView } from '../views/AdminPlansView'
import { Seo } from '@/components/seo'

export const AdminPlans = () => {
  return (
    <>
      <Seo title="Kelola Paket" path="/app/plans" robots="noindex, nofollow" />
      <AdminPlansView />
    </>
  )
}
