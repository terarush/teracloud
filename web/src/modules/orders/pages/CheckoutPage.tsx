import { CheckoutView } from "../views/CheckoutView"

interface CheckoutPageProps {
  orderId?: number
  planSlug?: string
}

export const CheckoutPage = ({ orderId, planSlug }: CheckoutPageProps) => {
  return <CheckoutView orderId={orderId} planSlug={planSlug} />
}
