import { useEffect, useState } from "react"
import { ArrowLeft, Check, Eye, EyeOff, Loader2 } from "lucide-react"
import { Link, useSearch } from "@tanstack/react-router"
import { toast } from "sonner"

import { useResetPasswordMutation } from "@/service/mutation/auth"
import { authApi } from "@/service/api/auth"
import { authContent } from "../content/auth"

export function ResetPasswordForm() {
  const search = useSearch({ from: "/reset-password" as any })
  const token = (search)?.token as string | undefined

  const [state, setState] = useState<"checking" | "valid" | "invalid" | "success">(token ? "checking" : "invalid")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const mutation = useResetPasswordMutation()

  useEffect(() => {
    if (!token) return
    let cancelled = false
    authApi.verifyResetToken(token).then(() => {
      if (!cancelled) setState("valid")
    }).catch(() => {
      if (!cancelled) setState("invalid")
    })
    return () => { cancelled = true }
  }, [token])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error(authContent.resetPassword.passwordsDontMatch)
      return
    }
    if (password.length < 8) {
      toast.error(authContent.resetPassword.passwordMin)
      return
    }
    mutation.mutate(
      { token: token || "", new_password: password },
      {
        onSuccess: () => setState("success"),
        onError: () => {
          setState("invalid")
          toast.error(authContent.resetPassword.tokenInvalid)
        },
      },
    )
  }

  if (state === "checking") {
    return (
      <div className="w-full text-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground mx-auto" />
      </div>
    )
  }

  if (state === "invalid") {
    return (
      <div className="w-full text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{authContent.resetPassword.invalidTitle}</h1>
        <p className="text-sm text-muted-foreground">{authContent.resetPassword.invalidSubtitle}</p>
        <Link
          to={"/forgot-password"}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-4"
        >
          {authContent.resetPassword.requestNewLink}
        </Link>
      </div>
    )
  }

  if (state === "success") {
    return (
      <div className="w-full text-center space-y-4">
        <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{authContent.resetPassword.successTitle}</h1>
        <p className="text-sm text-muted-foreground">{authContent.resetPassword.successSubtitle}</p>
        <Link
          to={"/login"}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-4"
        >
          <ArrowLeft className="size-3.5" /> {authContent.resetPassword.goToLogin}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-left space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{authContent.resetPassword.title}</h1>
        <p className="text-xs text-muted-foreground">{authContent.resetPassword.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-foreground">{authContent.resetPassword.passwordLabel}</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={authContent.resetPassword.placeholderMin}
              className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all"
            />
            <button type="button" onClick={() => setShowPw((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">{authContent.resetPassword.confirmPasswordLabel}</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={authContent.resetPassword.confirmPasswordPlaceholder}
              className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 transition-all"
            />
            <button type="button" onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending || !password || !confirmPassword}
          className="w-full bg-primary text-primary-foreground rounded-lg h-10 text-sm font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px"
        >
          {mutation.isPending ? <><Loader2 className="size-4 animate-spin" /> {authContent.resetPassword.resetting}</> : authContent.resetPassword.resetButton}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link
          to={"/login"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" /> {authContent.forgotPassword.backToLogin}
        </Link>
      </div>
    </div>
  )
}