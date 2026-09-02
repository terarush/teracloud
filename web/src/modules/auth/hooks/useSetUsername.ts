import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "@tanstack/react-router"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import { usernameSchema } from "@/modules/auth/schemas"
import { translateApiError } from "@/lib/translate-error"
import Cookies from "js-cookie"

export function useSetUsername() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [inputValue, setInputValueRaw] = useState("")
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(true)
  const checked = useRef(false)

  const setInputValue = useCallback((v: string) => {
    setInputValueRaw(v.replace(/\s/g, "").toLowerCase())
    setError("")
  }, [])

  const navigateAway = useCallback(() => {
    if (!Cookies.get("accessToken")) {
      navigate({ to: "/login" as any, replace: true })
      return
    }

    apiClient.get("/auth/profile").then((res: any) => {
      const user = res.data?.data || res.data
      if (user?.username) {
        navigate({ to: "/app" as any, replace: true })
      } else {
        setLoading(false)
      }
    }).catch(() => {
      Cookies.remove("accessToken")
      Cookies.remove("refreshToken")
      navigate({ to: "/login" as any, replace: true })
    })
  }, [navigate])

  useEffect(() => {
    if (checked.current) return
    checked.current = true
    navigateAway()
  }, [navigateAway])

  const handleSubmit = async (value: string) => {
    setTouched(true)
    const r = usernameSchema.safeParse({ username: value })
    if (!r.success) {
      setError(r.error.issues[0]?.message ?? "")
      return false
    }
    setPending(true)
    try {
      await apiClient.put("/auth/username", { username: value })
      await refreshUser()
      navigate({ to: "/app" as any, replace: true })
      return true
    } catch (err: any) {
      console.error("Failed to set username:", err)
      setError(translateApiError(err))
      return false
    } finally {
      setPending(false)
    }
  }

  return { inputValue, loading, pending, error, touched, setInputValue, setTouched, handleSubmit }
}
