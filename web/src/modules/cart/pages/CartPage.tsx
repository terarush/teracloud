import { CartView } from "../views/CartView"
import { Seo } from "@/components/seo"

export const CartPage = () => {
  return (
    <>
      <Seo title="Keranjang" path="/app/cart" robots="noindex, follow" />
      <CartView />
    </>
  )
}
