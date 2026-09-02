import { PlansOverviewView } from "../views/PlansOverviewView"
import { Seo } from "@/components/seo"

export const PlansOverviewPage = () => {
  return (
    <>
      <Seo title="Plans" path="/app/browse" robots="noindex, follow" />
      <PlansOverviewView />
    </>
  )
}