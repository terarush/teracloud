import { CheckoutView } from "../views/CheckoutView"
import { Seo } from "@/components/seo"

interface CheckoutPageProps {
  orderId?: number
  planSlug?: string
}

export const CheckoutPage = ({ orderId, planSlug }: CheckoutPageProps) => {
  return (
    <>
      <Seo title="Checkout" path={planSlug ? `/app/orders/checkout/plan/${planSlug}` : orderId ? `/app/orders/checkout/${orderId}` : "/app/orders"} robots="noindex, follow" />
      <CheckoutView orderId={orderId} planSlug={planSlug} />
    </>
  )
}
