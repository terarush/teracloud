import { Helmet } from "react-helmet-async"
import { companyMeta } from "@/meta"
import { currentLocale } from "@/lib/i18n"

interface SeoProps {
  /** Page title. When omitted, falls back to the company/SRG default title. */
  title?: string
  description?: string
  /** Route path without query, e.g. "/pricing". Used to build a stable canonical URL. */
  path?: string
  /** Override og:title (defaults to <title>). */
  ogTitle?: string
  /** Override og:description (defaults to <description>). */
  ogDescription?: string
  ogImage?: string
  /** robots value, default "index, follow" */
  robots?: string
}

function pageTitle(title?: string): string {
  if (title && title.includes(companyMeta.name)) return title
  return title ? `${title} — ${companyMeta.name}` : companyMeta.title
}

/**
 * Per-page SEO via react-helmet-async. Establishes title, meta description,
 * Open Graph / Twitter cards, canonical + og:url, and favicon + theme-color
 * from companyMeta at the app shell level.
 */
export function Seo({
  title,
  description,
  path = "/",
  ogTitle,
  ogDescription,
  ogImage,
  robots = "index, follow",
}: SeoProps) {
  const resolvedTitle = pageTitle(title)
  const resolvedDescription = description || companyMeta.description
  const lang = currentLocale()
  const baseUrl = "https://terarush.studio"
  const canonical = path === "/" ? baseUrl : `${baseUrl}${path}`

  return (
    <Helmet>
      <html lang={lang} />
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      <meta name="robots" content={robots} />

      {/* Canonical + Open Graph */}
      <link rel="canonical" href={canonical} />
      <meta property="og:site_name" content={companyMeta.name} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={lang === "id" ? "id_ID" : "en_US"} />
      <meta property="og:title" content={ogTitle || resolvedTitle} />
      <meta property="og:description" content={ogDescription || resolvedDescription} />
      <meta property="og:url" content={canonical} />
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || resolvedTitle} />
      <meta name="twitter:description" content={ogDescription || resolvedDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Icons + theme color (from companyMeta) */}
      <link rel="icon" type="image/x-icon" href={companyMeta.icon} />
      <meta name="theme-color" content="#4f46e5" />
    </Helmet>
  )
}