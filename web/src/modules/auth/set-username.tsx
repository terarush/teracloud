import { AtSign, Check, Loader2, ArrowRight, X } from "lucide-react"
import { usernameSchema } from "@/modules/auth/schemas"
import { useUsernameAvailability } from "./hooks/useAvailability"
import { useSetUsername } from "./hooks/useSetUsername"
import { authContent } from "./content/auth"
import { Seo } from "@/components/seo"
import { getSeoMeta } from "@/meta"

const c = authContent.setUsername

export default function SetUsernamePage() {
  const seo = getSeoMeta()
  const {
    inputValue, setInputValue, loading, pending, error, touched,
    setTouched, handleSubmit,
  } = useSetUsername()
  const isFormatValid = usernameSchema.safeParse({ username: inputValue }).success
  const availStatus = useUsernameAvailability(inputValue, isFormatValid)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(inputValue)
  }

  if (loading) {
    return (
      <>
        <Seo title={c.title} description={seo.description} path="/auth/set-username" robots="noindex, follow" />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">{c.loadingProfile}</p>
        </div>
      </>
    )
  }

  const statusIcon = () => {
    if (!inputValue) return null
    if (availStatus === "checking") return <Loader2 className="size-4 animate-spin text-muted-foreground" />
    if (availStatus === "available") return <Check className="size-4 text-primary" />
    if (availStatus === "taken") return <X className="size-4 text-destructive" />
  }

  const statusText = () => {
    if (availStatus === "checking") return <span className="text-muted-foreground">{c.checking}</span>
    if (availStatus === "available") return <span className="text-primary font-medium">{c.available}</span>
    if (availStatus === "taken") return <span className="text-destructive font-medium">{c.taken}</span>
  }

  return (
    <>
      <Seo title={c.title} description={seo.description} path="/auth/set-username" robots="noindex, follow" />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm">
        <div className="text-center space-y-1 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{c.title}</h1>
          <p className="text-sm text-muted-foreground">{c.subtitle}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="su-username" className="text-xs font-semibold text-foreground">{c.usernameLabel}</label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                id="su-username"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder={c.usernamePlaceholder}
                maxLength={c.maxLength}
                autoFocus
                aria-invalid={!!(touched && (error || availStatus === "taken"))}
                className="w-full h-10 pl-9 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">{statusIcon()}</div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[11px]">
                {error
                  ? <span className="text-destructive font-medium">{error}</span>
                  : statusText()
                }
              </p>
              <span className="text-[10px] text-muted-foreground tabular-nums">{inputValue.length}/{c.maxLength}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={availStatus !== "available" || pending}
            className="w-full bg-primary text-primary-foreground rounded-lg h-10 text-sm font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <><ArrowRight className="size-4" /> {c.submitButton}</>}
          </button>
        </form>
      </div>
      </div>
    </>
  )
}
