import { BASE_URL } from "./api-client"

/**
 * Backend uploads return a relative path like "/public/uploads/x.jpg".
 * Resolve it against the backend origin so <img> fetches from the API host
 * (the web SPA's nginx would otherwise fall back to index.html).
 * Absolute URLs (http/https/data) pass through untouched.
 */
export function resolveAssetUrl(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url
  }
  if (url.startsWith("/")) {
    return `${BASE_URL}${url}`
  }
  return url
}
