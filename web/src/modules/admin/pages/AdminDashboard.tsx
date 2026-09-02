import { AdminDashboardView } from '../views/AdminDashboardView'
import { Seo } from '@/components/seo'

export const AdminDashboard = () => {
  return (
    <>
      <Seo title="Console Admin" path="/app/console" robots="noindex, nofollow" />
      <AdminDashboardView />
    </>
  )
}
