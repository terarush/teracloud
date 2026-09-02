import { tl } from "@/lib/i18n"

export interface FeatureItem {
  title: string
  description: string
  icon: string
}

export interface FAQItem {
  question: string
  answer: string
}

export const homeFeatures: FeatureItem[] = [
  {
    title: tl("hosting.homeFeatures.instant.title"),
    description: tl("hosting.homeFeatures.instant.desc"),
    icon: "Zap",
  },
  {
    title: tl("hosting.homeFeatures.persistentStorage.title"),
    description: tl("hosting.homeFeatures.persistentStorage.desc"),
    icon: "HardDrive",
  },
  {
    title: tl("hosting.homeFeatures.webTerminal.title"),
    description: tl("hosting.homeFeatures.webTerminal.desc"),
    icon: "Terminal",
  },
  {
    title: tl("hosting.homeFeatures.realtimeMonitoring.title"),
    description: tl("hosting.homeFeatures.realtimeMonitoring.desc"),
    icon: "Activity",
  },
  {
    title: tl("hosting.homeFeatures.fullRoot.title"),
    description: tl("hosting.homeFeatures.fullRoot.desc"),
    icon: "ShieldCheck",
  },
  {
    title: tl("hosting.homeFeatures.autoPayment.title"),
    description: tl("hosting.homeFeatures.autoPayment.desc"),
    icon: "CreditCard",
  },
]

export const homeFAQs: FAQItem[] = [
  {
    question: tl("hosting.homeFaqs.what.q"),
    answer: tl("hosting.homeFaqs.what.a"),
  },
  {
    question: tl("hosting.homeFaqs.access.q"),
    answer: tl("hosting.homeFaqs.access.a"),
  },
  {
    question: tl("hosting.homeFaqs.restartSafe.q"),
    answer: tl("hosting.homeFaqs.restartSafe.a"),
  },
  {
    question: tl("hosting.homeFaqs.paymentMethods.q"),
    answer: tl("hosting.homeFaqs.paymentMethods.a"),
  },
]