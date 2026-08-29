import React, { useState } from "react"
import { Check, ArrowLeft, AtSign, Loader2, X, Eye, EyeOff } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { AuthField } from "./fragments/AuthField"
import { Divider } from "./fragments/Divider"
import { authContent } from "../content/auth"
import { googleLoginUrl } from "@/lib/api-client"
import { usernameSchema } from "@/modules/auth/schemas"
import { useEmailAvailability, useUsernameAvailability } from "../hooks/useAvailability"
import { useRegister } from "../hooks/useAuth"
import { z } from "zod"
import { validation } from "@/lib/i18n-validation"

type Step = 1 | 2 | 3

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-2 mb-6" role="progress" aria-label={authContent.register.stepIndicatorLabel}>
      {([1, 2, 3] as const).map((s) => (
        <React.Fragment key={s}>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-200 ${
              s < step
                ? "bg-primary text-primary-foreground"
                : s === step
                ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {s < step ? <Check className="size-3" /> : s}
          </div>
          {s < 3 && (
            <div
              className={`h-px flex-1 transition-colors duration-300 ${
                step > s ? "bg-primary" : "bg-border"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function getStrength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^a-zA-Z0-9]/.test(pw)) s++
  return s
}

const STRENGTH_COLOR = ["", "bg-destructive", "bg-primary/40", "bg-primary/70", "bg-primary"]

function strengthLabel(level: number) {
  switch (level) {
    case 1: return authContent.register.strength.weak
    case 2: return authContent.register.strength.fair
    case 3: return authContent.register.strength.good
    case 4: return authContent.register.strength.strong
    default: return ""
  }
}

const step1Schema = z.object({
  firstName: z.string().min(1, { error: validation.required }).min(2, { error: () => validation.minLength(2) }).max(50, { error: () => validation.maxLength(50) }),
  email: z.string().min(1, { error: validation.required }).email({ error: validation.invalidEmail }),
})

interface Step1Props {
  firstName: string; lastName: string; email: string
  onChange: (d: { firstName?: string; lastName?: string; email?: string }) => void
  onNext: () => void
}

function Step1Form({ firstName, lastName, email, onChange, onNext }: Step1Props) {
  const [touched, setTouched] = useState<{ firstName?: boolean; lastName?: boolean; email?: boolean }>({})
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string }>({})
  const isEmailValid = step1Schema.shape.email.safeParse(email).success
  const emailAvail = useEmailAvailability(email, isEmailValid)

  const validateField = (field: "firstName" | "email", value: string) => {
    if (field === "firstName") return value.length < 2 ? validation.minLength(2) : undefined
    const r = step1Schema.shape[field].safeParse(value)
    return r.success ? undefined : r.error.issues[0]?.message
  }

  const handleFieldChange = (field: "firstName" | "lastName" | "email", value: string) => {
    onChange({ [field]: value })
    if (touched[field]) {
      if (field === "lastName") return
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
    }
  }

  const handleBlur = (field: "firstName" | "lastName" | "email") => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === "lastName") return
    const value = field === "firstName" ? firstName : email
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ firstName: true, lastName: true, email: true })
    const r = step1Schema.safeParse({ firstName, email })
    if (!r.success) {
      const errs: typeof errors = {}
      r.error.issues.forEach((i) => { errs[i.path[0] as keyof typeof errs] = i.message })
      setErrors(errs); return
    }
    if (emailAvail !== "available") { return }
    setErrors({}); onNext()
  }

  const emailStatusIcon = () => {
    if (!email || !isEmailValid) return null
    if (emailAvail === "checking") return <Loader2 className="size-4 animate-spin text-muted-foreground" />
    if (emailAvail === "available") return <Check className="size-4 text-primary" />
    if (emailAvail === "taken") return <X className="size-4 text-destructive" />
  }

  return (
    <form onSubmit={handleNext} className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-200">
      <AuthField
        id="firstName"
        label={authContent.register.firstNameLabel}
        type="text"
        placeholder={authContent.register.firstNamePlaceholder}
        value={firstName}
        onChange={(e) => handleFieldChange("firstName", e.target.value)}
        onBlur={() => handleBlur("firstName")}
        error={errors.firstName}
      />
      <AuthField
        id="lastName"
        label={authContent.register.lastNameLabel}
        type="text"
        placeholder={authContent.register.lastNamePlaceholder}
        value={lastName}
        onChange={(e) => handleFieldChange("lastName", e.target.value)}
        onBlur={() => handleBlur("lastName")}
      />
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-xs font-semibold text-foreground">{authContent.register.emailLabel}</label>
        <div className="relative">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            placeholder={authContent.register.emailPlaceholder}
            aria-invalid={!!errors.email}
            className="w-full h-10 bg-background border border-input rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground pr-10 transition-all focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 disabled:opacity-50"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{emailStatusIcon()}</div>
        </div>
        {errors.email ? (
          <p className="text-xs text-destructive font-medium">{errors.email}</p>
        ) : (email && isEmailValid) && (
          <p className="text-[11px]">
            {emailAvail === "checking" && <span className="text-muted-foreground">{authContent.register.checking}</span>}
            {emailAvail === "available" && <span className="text-primary font-medium">{authContent.register.emailAvailable}</span>}
            {emailAvail === "taken" && <span className="text-destructive font-medium">{authContent.register.emailTaken}</span>}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={emailAvail === "taken" || emailAvail === "checking"}
        className="w-full bg-primary text-primary-foreground rounded-lg h-10 text-sm font-semibold transition-all duration-200 flex items-center justify-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px"
      >
        {authContent.register.continueText}
      </button>
    </form>
  )
}

interface Step2Props {
  username: string
  onUsernameChange: (v: string) => void
  onBack: () => void
  onNext: () => void
}

function Step2Form({ username, onUsernameChange, onBack, onNext }: Step2Props) {
  const [touched, setTouched] = useState(false)
  const [validationError, setValidationError] = useState<string | undefined>()

  const isFormatValid = usernameSchema.safeParse({ username }).success
  const availStatus = useUsernameAvailability(username, isFormatValid)

  const validate = () => {
    const r = usernameSchema.safeParse({ username })
    if (!r.success) { setValidationError(r.error.issues[0]?.message); return false }
    if (availStatus === "taken") { setValidationError(authContent.register.usernameTakenTryAnother); return false }
    if (availStatus !== "available") { setValidationError(authContent.register.waitingForCheck); return false }
    setValidationError(undefined); return true
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (validate()) onNext()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s/g, "").toLowerCase()
    onUsernameChange(v)
    if (touched) {
      const r = usernameSchema.safeParse({ username: v })
      setValidationError(r.success ? undefined : r.error.issues[0]?.message)
    }
  }

  const statusIcon = () => {
    if (!username) return null
    if (availStatus === "checking") return <Loader2 className="size-4 animate-spin text-muted-foreground" />
    if (availStatus === "available") return <Check className="size-4 text-primary" />
    if (availStatus === "taken") return <X className="size-4 text-destructive" />
  }

  const statusText = () => {
    if (!username || availStatus === "idle") return null
    if (availStatus === "checking") return <span className="text-muted-foreground">{authContent.register.checking}</span>
    if (availStatus === "available") return <span className="text-primary font-medium">{authContent.register.usernameAvailable}</span>
    return <span className="text-destructive font-medium">{authContent.register.usernameTaken}</span>
  }

  return (
    <form onSubmit={handleNext} className="space-y-5 animate-in slide-in-from-right-4 fade-in duration-200">
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-xs font-semibold text-foreground">{authContent.register.usernameLabel}</label>
        <div className="relative">
          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleChange}
            onBlur={() => setTouched(true)}
            placeholder={authContent.register.usernamePlaceholderShort}
            maxLength={20}
            aria-invalid={!!(touched && (validationError || availStatus === "taken"))}
            className="w-full h-10 pl-9 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon()}</div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px]">
            {touched && validationError
              ? <span className="text-destructive font-medium">{validationError}</span>
              : statusText()
            }
          </p>
          <span className="text-[10px] text-muted-foreground tabular-nums">{username.length}/20</span>
        </div>

        {availStatus === "taken" && username && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <p className="text-[11px] text-muted-foreground w-full">{authContent.register.tryOneOf}</p>
            {[`${username}_`, `${username}01`, `${username}_id`].map((s) => (
              <button
                key={s} type="button"
                onClick={() => { onUsernameChange(s.slice(0, 20)); setTouched(false) }}
                className="text-[11px] px-2 py-0.5 rounded-full border border-input text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {s.slice(0, 20)}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {authContent.register.usernameHint}
      </p>

      <div className="flex gap-2">
        <button
          type="button" onClick={onBack}
          className="flex items-center gap-1.5 px-4 h-10 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-3.5" /> {authContent.register.back}
        </button>
        <button
          type="submit"
          disabled={availStatus !== "available"}
          className="flex-1 bg-primary text-primary-foreground rounded-lg h-10 text-sm font-semibold transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-px"
        >
          {authContent.register.continueText}
        </button>
      </div>
    </form>
  )
}

const passwordStepSchema = z.object({
  password: z.string()
    .min(1, { error: validation.required })
    .min(8, { error: validation.passwordMin })
    .regex(/[A-Z]/, { error: validation.passwordUpper })
    .regex(/[a-z]/, { error: validation.passwordLower })
    .regex(/[0-9]/, { error: validation.passwordNumber }),
  confirmPassword: z.string().min(1, { error: validation.required }),
}).refine((d) => d.password === d.confirmPassword, {
  error: validation.passwordsDontMatch,
  path: ["confirmPassword"],
})

interface Step3Props {
  password: string; confirmPassword: string; agreeTerms: boolean
  onChange: (d: { password?: string; confirmPassword?: string }) => void
  onAgreeTerms: (v: boolean) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  isPending: boolean
  errorMessage: string
}

function Step3Form({ password, confirmPassword, agreeTerms, onChange, onAgreeTerms, onBack, onSubmit, isPending, errorMessage }: Step3Props) {
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({})
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const strength = getStrength(password)

  const validate = () => {
    const r = passwordStepSchema.safeParse({ password, confirmPassword })
    const errs: typeof errors = {}
    if (!r.success) r.error.issues.forEach((i) => { errs[i.path[0] as keyof typeof errs] = i.message })
    setErrors(errs)
    return r.success
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 fade-in duration-200">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium">
          {errorMessage}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-xs font-semibold text-foreground">
          {authContent.register.passwordLabel}
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? "text" : "password"}
            value={password}
            placeholder={authContent.register.passwordPlaceholder}
            onChange={(e) => onChange({ password: e.target.value })}
            disabled={isPending}
            aria-invalid={!!errors.password}
            className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 transition-all disabled:opacity-50"
          />
          <button type="button" onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none">
            {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && <p className="text-[11px] text-destructive font-medium">{errors.password}</p>}

        {password && (
          <div>
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((l) => (
                <div key={l} className={`h-1 flex-1 rounded-full transition-all duration-300 ${l <= strength ? STRENGTH_COLOR[strength] : "bg-border"}`} />
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {authContent.register.passwordStrength} {strengthLabel(strength)}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
          {authContent.register.confirmPasswordLabel}
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            placeholder={authContent.register.confirmPasswordPlaceholder}
            onChange={(e) => onChange({ confirmPassword: e.target.value })}
            disabled={isPending}
            aria-invalid={!!errors.confirmPassword}
            className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 transition-all disabled:opacity-50"
          />
          <button type="button" onClick={() => setShowConfirm((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none">
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-[11px] text-destructive font-medium">{errors.confirmPassword}</p>}
        {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
          <p className="text-[11px] text-primary font-medium flex items-center gap-1">
            <Check className="size-3.5" /> {authContent.register.passwordMatch}
          </p>
        )}
      </div>

      <div className="space-y-1 pt-1">
        <div className="flex items-start gap-2">
          <input
            type="checkbox" id="terms"
            checked={agreeTerms}
            onChange={(e) => onAgreeTerms(e.target.checked)}
            disabled={isPending}
            className="size-3.5 mt-0.5 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none font-medium leading-normal">
            {authContent.register.termsText}{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className="text-foreground hover:underline font-semibold">{authContent.register.termsLink}</a>{" "}
            {authContent.register.andText}{" "}
            <a href="/privacy" target="_blank" rel="noreferrer" className="text-foreground hover:underline font-semibold">{authContent.register.privacyLink}</a>
          </label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button" onClick={onBack} disabled={isPending}
          className="flex items-center gap-1.5 px-4 h-10 rounded-lg border border-input text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <ArrowLeft className="size-3.5" /> {authContent.register.back}
        </button>
        <button
          type="submit" disabled={isPending || !agreeTerms}
          className="flex-1 bg-primary text-primary-foreground rounded-lg h-10 text-sm font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px"
        >
          {isPending ? <><Loader2 className="size-4 animate-spin" /> {authContent.register.submittingButton}</> : authContent.register.createAccount}
        </button>
      </div>
    </form>
  )
}

export function RegisterForm() {
  const {
    step, firstName, lastName, email, username, password, confirmPassword, agreeTerms, errorMessage, isPending,
    setStep, setFirstName, setLastName, setEmail, setUsername, setPassword, setConfirmPassword, setAgreeTerms, setErrorMessage,
    handleFinalSubmit,
  } = useRegister()

  const STEP_META: Record<Step, { title: string; subtitle: string }> = {
    1: { title: authContent.register.title, subtitle: authContent.register.subtitle },
    2: { title: authContent.register.step2Title, subtitle: authContent.register.step2Subtitle },
    3: { title: authContent.register.step3Title, subtitle: authContent.register.step3Subtitle },
  }

  const { title, subtitle } = STEP_META[step]

  return (
    <div className="w-full">
      <a
        href={googleLoginUrl}
        className="w-full h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 mb-5 no-underline"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {authContent.register.googleButton}
      </a>

      <Divider>{authContent.register.divider}</Divider>

      <StepIndicator step={step} />

      <div className="text-left space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      {step === 1 && (
        <Step1Form
          firstName={firstName} lastName={lastName} email={email}
          onChange={(d) => { if (d.firstName !== undefined) setFirstName(d.firstName); if (d.lastName !== undefined) setLastName(d.lastName); if (d.email !== undefined) setEmail(d.email) }}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2Form
          username={username}
          onUsernameChange={setUsername}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <Step3Form
          password={password} confirmPassword={confirmPassword} agreeTerms={agreeTerms}
          onChange={(d) => {
            if (d.password !== undefined) setPassword(d.password)
            if (d.confirmPassword !== undefined) setConfirmPassword(d.confirmPassword)
          }}
          onAgreeTerms={setAgreeTerms}
          onBack={() => { setStep(2); setErrorMessage("") }}
          onSubmit={handleFinalSubmit}
          isPending={isPending}
          errorMessage={errorMessage}
        />
      )}

      <div className="mt-5 text-center">
        <p className="text-muted-foreground text-xs">
          {authContent.register.hasAccountText}{" "}
          <Link to={"/login"} className="font-semibold text-primary hover:underline">
            {authContent.register.signInLink}
          </Link>
        </p>
      </div>
    </div>
  )
}