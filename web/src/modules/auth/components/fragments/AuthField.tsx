import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

interface AuthFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function AuthField({ label, error, type = "text", className, id, ...props }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className="space-y-1.5 text-left">
      <label htmlFor={id} className="text-xs font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          aria-invalid={!!error}
          className={[
            "w-full h-10 bg-background border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-all",
            "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            error
              ? "border-destructive aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              : "border-input",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            isPassword ? "pr-10" : "",
            className || "",
          ].join(" ")}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive font-medium">{error}</p>
      )}
    </div>
  )
}
