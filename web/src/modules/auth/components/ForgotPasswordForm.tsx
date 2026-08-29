import { useState } from "react"
import { ArrowLeft, Check } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { toast } from "sonner"
import { Trans } from "react-i18next"

import { AuthField } from "./fragments/AuthField"
import { authContent } from "../content/auth"
import { useForgotPasswordMutation } from "@/service/mutation/auth"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const mutation = useForgotPasswordMutation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(email, {
      onSuccess: () => setSent(true),
      onError: (err: any) => {
        console.error("Forgot password error:", err)
        toast.error(authContent.forgotPassword.sendFailed)
      },
    })
  }

  if (sent) {
    return (
      <div className="w-full text-center space-y-4">
        <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Check className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{authContent.forgotPassword.sentTitle}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          <Trans
            i18nKey="auth.forgotPassword.sentEmailBody"
            values={{ email }}
          />
        </p>
        <Link
          to={"/login"}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline mt-4"
        >
          <ArrowLeft className="size-3.5" /> {authContent.forgotPassword.backToLogin}
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-left space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{authContent.forgotPassword.title}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Email"
          id="email"
          name="email"
          type="email"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={mutation.isPending || !email}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? authContent.forgotPassword.submittingButton : authContent.forgotPassword.submitButton}
        </button>

        <div className="text-center">
          <Link
            to={"/login"}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> {authContent.forgotPassword.backToLogin}
          </Link>
        </div>
      </form>
    </div>
  )
}
