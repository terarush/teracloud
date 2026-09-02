import { useTranslation } from "react-i18next"
import { Link } from "@tanstack/react-router"

export default function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
            {t("common.notFoundEyebrow")}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {t("common.notFoundTitle")}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            {t("common.notFoundDesc")}
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-primary hover:bg-primary/80 text-primary-foreground rounded-lg h-10 px-6 text-sm font-semibold transition-colors focus:outline-hidden focus:ring-3 focus:ring-ring/50"
          >
            {t("common.goBackHome")}
          </Link>
        </div>
      </div>
    </div>
  )
}
