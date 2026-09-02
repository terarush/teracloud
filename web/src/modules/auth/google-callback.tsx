import { useGoogleCallback } from "./hooks/useGoogleCallback"
import { authContent } from "./content/auth"
import { Seo } from "@/components/seo"

export default function GoogleCallback() {
  useGoogleCallback()

  return (
    <>
      <Seo title="Masuk" description={authContent.googleCallback.loading} path="/oauth2/google/callback" robots="noindex, follow" />
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">{authContent.googleCallback.loading}</p>
      </div>
    </>
  )
}
