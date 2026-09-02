import { tl } from "@/lib/i18n"

export interface PricingFeatureComparison {
  feature: string
  starter: string | boolean
  standard: string | boolean
  pro: string | boolean
}

export const pricingComparisonList: PricingFeatureComparison[] = [
  { feature: tl("hosting.featureComparison.dedicatedVcpu"), starter: tl("hosting.featureComparison.core1"), standard: tl("hosting.featureComparison.core2"), pro: tl("hosting.featureComparison.core4") },
  { feature: tl("hosting.featureComparison.ramAlloc"), starter: tl("hosting.featureComparison.ram512"), standard: tl("hosting.featureComparison.ram1024"), pro: tl("hosting.featureComparison.ram2048") },
  { feature: tl("hosting.featureComparison.nvmeStorage"), starter: tl("hosting.featureComparison.disk10"), standard: tl("hosting.featureComparison.disk20"), pro: tl("hosting.featureComparison.disk40") },
  { feature: tl("hosting.featureComparison.webTerminal"), starter: true, standard: true, pro: true },
  { feature: tl("hosting.featureComparison.sshAccess"), starter: true, standard: true, pro: true },
  { feature: tl("hosting.featureComparison.persistentVolume"), starter: true, standard: true, pro: true },
  { feature: tl("hosting.featureComparison.realtimeStats"), starter: true, standard: true, pro: true },
  { feature: tl("hosting.featureComparison.resetRebuild"), starter: true, standard: true, pro: true },
]