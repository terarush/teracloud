import { useState, useEffect, useRef } from "react"
import { authApi } from "@/service/api/auth"

export type AvailStatus = "idle" | "checking" | "available" | "taken"

export function useEmailAvailability(email: string, isValid: boolean) {
  const [status, setStatus] = useState<AvailStatus>("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seq = useRef(0)

  useEffect(() => {
    if (!email || !isValid) { setStatus("idle"); return }
    setStatus("checking")
    if (timer.current) clearTimeout(timer.current)
    const id = ++seq.current
    timer.current = setTimeout(async () => {
      try {
        const res = await authApi.checkEmail(email)
        if (id === seq.current) setStatus(res.available ? "available" : "taken")
      } catch {
        if (id === seq.current) setStatus("idle")
      }
    }, 500)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [email, isValid])

  return status
}

export function useUsernameAvailability(username: string, isValid: boolean) {
  const [status, setStatus] = useState<AvailStatus>("idle")
  const seq = useRef(0)

  useEffect(() => {
    if (!username || !isValid) { setStatus("idle"); return }
    setStatus("checking")
    const id = ++seq.current
    const t = setTimeout(async () => {
      try {
        const res = await authApi.checkUsername(username)
        if (id === seq.current) setStatus(res.available ? "available" : "taken")
      } catch {
        if (id === seq.current) setStatus("idle")
      }
    }, 500)
    return () => { clearTimeout(t) }
  }, [username, isValid])

  return status
}
