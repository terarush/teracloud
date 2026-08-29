export interface PricingFeatureComparison {
  feature: string
  starter: string | boolean
  standard: string | boolean
  pro: string | boolean
}

export const pricingComparisonList: PricingFeatureComparison[] = [
  { feature: "Dedicated vCPU", starter: "1 Core", standard: "2 Cores", pro: "4 Cores" },
  { feature: "RAM Alokasi", starter: "512 MB", standard: "1024 MB", pro: "2048 MB" },
  { feature: "NVMe Storage", starter: "10 GB", standard: "20 GB", pro: "40 GB" },
  { feature: "Web Terminal (Browser)", starter: true, standard: true, pro: true },
  { feature: "SSH Access (Custom Port)", starter: true, standard: true, pro: true },
  { feature: "Persistent Data Volume", starter: true, standard: true, pro: true },
  { feature: "Realtime Stats & Metrics", starter: true, standard: true, pro: true },
  { feature: "Reset / Rebuild Container", starter: true, standard: true, pro: true },
]
