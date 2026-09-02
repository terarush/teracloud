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

// translateApiMessage resolves a backend success-message key (e.g.
// "msg.auth.registration_success") to localized text via the merged
// "translation" namespace. When the key has no translation registered
// (i18next returns the key itself), falls back to the raw key string.
export function translateApiMessage(
  message?: string,
  t: (key: string, opts?: Record<string, unknown>) => string = tl
): string {
  if (!message) return ''
  const translated = t(message)
  return translated && translated !== message ? translated : message
}
