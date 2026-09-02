import { BillingView } from '../views/BillingView'
import { Seo } from '@/components/seo'

export const BillingPage = () => {
  return (
    <>
      <Seo title="Billing" path="/app/billing" robots="noindex, follow" />
      <BillingView />
    </>
  )
}
