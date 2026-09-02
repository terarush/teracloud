import { DashboardView } from '../views/DashboardView'
import { Seo } from '@/components/seo'

export const DashboardPage = () => {
  return (
    <>
      <Seo title="Dashboard" path="/app" robots="noindex, follow" />
      <DashboardView />
    </>
  )
}
