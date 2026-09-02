import React from "react"
import { OrderStatusView } from "../views/OrderStatusView"
import { Seo } from "@/components/seo"

export const OrderStatusPage: React.FC = () => {
  return (
    <>
      <Seo title="Status Pesanan" path="/app/orders/finish" robots="noindex, follow" />
      <OrderStatusView />
    </>
  )
}
