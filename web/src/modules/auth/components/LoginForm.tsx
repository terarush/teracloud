import { Link } from "@tanstack/react-router"

import { AuthField } from "./fragments/AuthField"
import { googleLoginUrl } from "@/lib/api-client"
import { Divider } from "./fragments/Divider"
import { authContent } from "../content/auth"
import { useLogin } from "../hooks/useAuth"

export function LoginForm() {
  const {
    email, password, rememberMe, errors, errorMessage, isPending,
    setRememberMe,
    handleEmailChange, handleEmailBlur,
    handlePasswordChange, handlePasswordBlur,
    onSubmit,
  } = useLogin()

  return (
    <div className="w-full">
      <div className="text-left space-y-1 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {authContent.login.title}
        </h1>
        <p className="text-xs text-muted-foreground">
          {authContent.login.subtitle}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <AuthField
          id="email"
          label={authContent.login.emailLabel}
          type="email"
          placeholder={authContent.login.emailPlaceholder}
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={handleEmailBlur}
          error={errors.email}
          disabled={isPending}
        />

        <AuthField
          id="password"
          label={authContent.login.passwordLabel}
          type="password"
          placeholder={authContent.login.passwordPlaceholder}
          value={password}
          onChange={(e) => handlePasswordChange(e.target.value)}
          onBlur={handlePasswordBlur}
          error={errors.password}
          disabled={isPending}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-3.5 rounded border-input text-primary focus-visible:ring-3 focus-visible:ring-ring/50 cursor-pointer"
              disabled={isPending}
            />
            <span className="text-muted-foreground font-medium">
              {authContent.login.rememberMe}
            </span>
          </label>
          <Link
            to={"/forgot-password"}
            className="text-foreground hover:underline font-semibold"
          >
            {authContent.login.forgotPassword}
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-primary-foreground rounded-lg h-10 text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center border-0 shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed active:translate-y-px"
        >
          {isPending ? authContent.login.submittingButton : authContent.login.submitButton}
        </button>
      </form>

      <Divider>{authContent.login.or}</Divider>

      <a
        href={googleLoginUrl}
        className="w-full h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground flex items-center justify-center gap-2 hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 no-underline"
      >
        <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {authContent.login.googleButton}
      </a>

      <div className="mt-5 space-y-5">
        <div className="text-center pt-1">
          <p className="text-muted-foreground text-xs">
            {authContent.login.noAccountText}{" "}
            <Link
              to={"/register"}
              className="font-semibold text-primary hover:underline"
            >
              {authContent.login.signUpLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
