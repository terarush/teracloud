import { PricingView } from '../views/PricingView'
import { Seo } from '@/components/seo'
import { getSeoMeta } from '@/meta'

export const PricingPage = () => {
  const seo = getSeoMeta()
  return (
    <>
      <Seo title="Pricing" description={seo.description} path="/pricing" ogImage="/company/logo.png" />
      <PricingView />
    </>
  )
}
