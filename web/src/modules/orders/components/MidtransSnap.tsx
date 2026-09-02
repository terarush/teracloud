import React from "react"
import { Button } from "@/components/ui/button"
import { CreditCard, ExternalLink } from "lucide-react"
import { useTranslation } from "react-i18next"

declare global {
  interface Window {
    snap?: any
  }
}

interface MidtransSnapProps {
  snapToken?: string
  redirectUrl?: string
  onSuccess?: () => void
  onPending?: () => void
  onError?: () => void
  onClose?: () => void
}

export const MidtransSnap: React.FC<MidtransSnapProps> = ({
  snapToken,
  redirectUrl,
  onSuccess,
  onPending,
  onError,
  onClose,
}) => {
  const { t } = useTranslation()
  const handlePay = () => {
    if (snapToken && window.snap) {
      window.snap.pay(snapToken, {
        onSuccess: () => {
          onSuccess?.()
        },
        onPending: () => {
          onPending?.()
        },
        onError: () => {
          onError?.()
        },
        onClose: () => {
          onClose?.()
        },
      })
    } else if (redirectUrl) {
      window.location.href = redirectUrl
    }
  }

  return (
    <div className="space-y-4">
      <Button
        size="lg"
        onClick={handlePay}
        className="w-full flex items-center justify-center gap-2 font-bold cursor-pointer"
      >
        <CreditCard className="w-5 h-5" />
        <span>{t("hosting.payNowShort")}</span>
      </Button>

      {redirectUrl && (
        <p className="text-center text-xs text-muted-foreground">
          {t("hosting.openLink")}{" "}
          <a
            href={redirectUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary underline inline-flex items-center gap-0.5"
          >
            {t("hosting.midtransPage")} <ExternalLink className="w-3 h-3" />
          </a>
        </p>
      )}
    </div>
  )
}
