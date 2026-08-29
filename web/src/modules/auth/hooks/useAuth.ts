import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { useLoginMutation, useRegisterMutation } from "@/service/mutation/auth"
import { translateApiError } from "@/lib/translate-error"
import { tl } from "@/lib/i18n"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function useLogin() {
  const loginMutation = useLoginMutation()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [errorMessage, setErrorMessage] = useState("")
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({})

  const validateEmail = (value: string) => {
    if (!value) return tl("auth.login.emailLabel")
    if (!EMAIL_REGEX.test(value)) return tl("error.AUTH_EMAIL_INVALID")
    return undefined
  }

  const handleEmailChange = (value: string) => {
    setEmail(value)
    if (touched.email) setErrors((p) => ({ ...p, email: validateEmail(value) }))
  }

  const handleEmailBlur = () => {
    setTouched((p) => ({ ...p, email: true }))
    setErrors((p) => ({ ...p, email: validateEmail(email) }))
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    if (touched.password) {
      setErrors((p) => ({ ...p, password: !value ? tl("error.AUTH_INVALID_PASSWORD") : undefined }))
    }
  }

  const handlePasswordBlur = () => {
    setTouched((p) => ({ ...p, password: true }))
    setErrors((p) => ({ ...p, password: !password ? tl("error.AUTH_INVALID_PASSWORD") : undefined }))
  }

  const validate = () => {
    const errs: typeof errors = {}
    const e = validateEmail(email)
    if (e) errs.email = e
    if (!password) errs.password = tl("error.AUTH_INVALID_PASSWORD")
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
    setErrorMessage("")
    if (!validate()) return

    try {
      await loginMutation.mutateAsync({ email, password })
      toast.success(tl("common.success"))
      navigate({ to: "/app" as any })
    } catch (error: any) {
      const isNetError = !error?.response && (error?.code === "ERR_NETWORK" || error?.message === "Network Error")
      if (isNetError) {
        setErrorMessage(tl("error.SERVICE_UNAVAILABLE"))
      } else {
        const msg = translateApiError(error)
        setErrorMessage(msg)
        toast.error(msg || tl("common.error"))
      }
    }
  }

  return {
    email, password, rememberMe, errors, errorMessage, isPending: loginMutation.isPending,
    setRememberMe,
    handleEmailChange, handleEmailBlur,
    handlePasswordChange, handlePasswordBlur,
    onSubmit,
  }
}

export function useRegister() {
  const registerMutation = useRegisterMutation()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [errorMessage, setErrorMessage] = useState("")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    try {
      await registerMutation.mutateAsync({ first_name: firstName, last_name: lastName, email, password, confirm_password: confirmPassword, username })
      toast.success(tl("common.success"))
      navigate({ to: "/app" as any })
    } catch (error: any) {
      const msg = translateApiError(error)
      setErrorMessage(msg)
      toast.error(msg || tl("common.error"))
    }
  }

  return {
    step, firstName, lastName, email, username, password, confirmPassword, agreeTerms, errorMessage,
    isPending: registerMutation.isPending,
    setStep, setFirstName, setLastName, setEmail, setUsername, setPassword, setConfirmPassword, setAgreeTerms,
    setErrorMessage,
    handleFinalSubmit,
  }
}

type Step = 1 | 2 | 3
