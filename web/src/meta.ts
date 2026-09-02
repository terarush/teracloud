import { tl } from "@/lib/i18n"

export const companyMeta = {
  name: "TeraCloud",
  logo: "/company/logo.png",
  logoWhite: "/company/logo.png",
  icon: "/favicon.ico",
  title: "TeraCloud - Modern Cloud & Container Hosting Platform",
  baseDomain: "teracloud.id",
  description:
    "High-performance cloud hosting and modern container deployment platform. Effortlessly deploy applications, manage databases, and scale infrastructure.",
  tagline: "Deploy Faster. Scale Smarter.",
  url: "https://teracloud.id",
  email: "support@teracloud.id",
  phone: "+62 821 4333 8737",
  whatsapp: "https://wa.me/6282143338737",
  links: {
    github: "https://github.com/teracloud",
    twitter: "https://twitter.com/teracloud",
    linkedin: "https://linkedin.com/company/teracloud",
    instagram: "https://instagram.com/teracloud.tech",
  },
  location: {
    country: "Indonesia",
    region: "Malang, East Java",
    timezone: "GMT+7 (WIB)",
  },
  businessHours: {
    weekdays: "8:00 AM - 10:00 PM GMT+7",
    weekends: "9:00 AM - 8:00 PM GMT+7",
  },
}

export type CompanyMetaType = typeof companyMeta

export interface SeoMeta {
  title: string
  description: string
  tagline: string
}

export function getSeoMeta(): SeoMeta {
  return {
    title: tl("seo.title") || companyMeta.title,
    description: tl("seo.description") || companyMeta.description,
    tagline: tl("seo.tagline") || companyMeta.tagline,
  }
}
