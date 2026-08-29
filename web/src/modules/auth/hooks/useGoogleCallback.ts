import { useEffect, useRef } from "react"
import { useNavigate } from "@tanstack/react-router"
import Cookies from "js-cookie"
import { useAuth } from "@/contexts/auth-context"

export function useGoogleCallback() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")
    if (!token) {
      navigate({ to: "/login" as any })
      return
    }

    Cookies.set("accessToken", token, { expires: 7 })

    if (params.get("needs_username") === "1") {
      navigate({ to: "/auth/set-username" as any, replace: true })
      return
    }

    refreshUser()
      .then(() => navigate({ to: "/app" as any, replace: true }))
      .catch(() => navigate({ to: "/login" as any, replace: true }))
  }, [])
}
