import { AdminOrdersView } from '../views/AdminOrdersView'
import { Seo } from '@/components/seo'

export const AdminOrders = () => {
  return (
    <>
      <Seo title="Kelola Pesanan" path="/app/orders-list" robots="noindex, nofollow" />
      <AdminOrdersView />
    </>
  )
}
