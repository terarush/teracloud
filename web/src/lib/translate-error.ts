import { tl } from './i18n'

export interface ApiErrorPayloadLite {
  code?: string
  message?: string
}

function extractPayload(err: unknown): ApiErrorPayloadLite | undefined {
  const e = err as {
    response?: { data?: { error?: ApiErrorPayloadLite } }
  }
  return e.response?.data?.error
}

export function translateApiError(
  err: unknown,
  t: (key: string, opts?: Record<string, unknown>) => string = tl
): string {
  const payload = extractPayload(err)
  if (!payload) return ''
  const { code, message } = payload
  if (code && code !== 'VALIDATION_ERROR') {
    const key = `error.${code}`
    const translated = t(key)
    if (translated && translated !== key) return translated
  }
  return message ?? ''
}
