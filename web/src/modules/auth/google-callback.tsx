import { useGoogleCallback } from "./hooks/useGoogleCallback"
import { authContent } from "./content/auth"

export default function GoogleCallback() {
  useGoogleCallback()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-muted-foreground">{authContent.googleCallback.loading}</p>
    </div>
  )
}
