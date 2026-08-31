import { clsx  } from "clsx"
import type {ClassValue} from "clsx";
import { twMerge } from "tailwind-merge"
import { BASE_URL } from "./api-client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(url?: string | null): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`
  return `${BASE_URL}${cleanUrl}`
}

