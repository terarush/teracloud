import React from "react"
import { vouchersApi   } from "../api/vouchers"
import type {VoucherQuote, VoucherQuoteItem} from "../api/vouchers";

const DEBOUNCE_MS = 400

/**
 * Live voucher validation with debounce. Validates the entered code against the
 * current line items and exposes the resulting quote (or null when no code),
 * so the price summary can update as the user types.
 */
export function useVoucherQuote() {
  const [quote, setQuote] = React.useState<VoucherQuote | null>(null)
  const [isValidating, setIsValidating] = React.useState(false)
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce and validate. Pass an empty code to clear.
  const validate = React.useCallback((code: string, items: VoucherQuoteItem[]) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    const trimmed = code.trim()
    if (!trimmed) {
      setQuote(null)
      setIsValidating(false)
      return
    }
    if (items.length === 0) {
      setQuote({ valid: false, code: trimmed, total_subtotal: 0, total_discount: 0, total_after: 0, error_code: "NO_ITEMS", error_message: "Belum ada item" })
      setIsValidating(false)
      return
    }
    setIsValidating(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await vouchersApi.validate(trimmed, items)
        setQuote(res)
      } catch (err) {
        console.error("Failed to validate voucher quote:", err)
        setQuote({
          valid: false,
          code: trimmed,
          total_subtotal: items.reduce((s, i) => s + i.subtotal, 0),
          total_discount: 0,
          total_after: items.reduce((s, i) => s + i.subtotal, 0),
          error_code: "VOUCHER_CHECK_FAILED",
          error_message: "Gagal memeriksa voucher",
        })
      } finally {
        setIsValidating(false)
      }
    }, DEBOUNCE_MS)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return { quote, isValidating, validate }
}
