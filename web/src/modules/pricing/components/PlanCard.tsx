import React from "react"
import type { Plan } from "@/service/api/plans"
import { Button } from "@/components/ui/button"
import { Check, ShoppingCart, ArrowRight } from "lucide-react"
import { getImageUrl } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface PlanCardProps {
  plan: Plan
  onSelect: (plan: Plan) => void
  onAddToCart?: (plan: Plan) => void
  isAddingToCart?: boolean
  isPopular?: boolean
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSelect,
  onAddToCart,
  isAddingToCart = false,
  isPopular = false,
}) => {
  const { t } = useTranslation()
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(plan.price_monthly)

  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <div
      className={`relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl transition-all duration-200 overflow-hidden ${
        isPopular
          ? "bg-card ring-2 ring-primary z-10 shadow-lg shadow-primary/5"
          : "bg-card ring-1 ring-foreground/10 hover:ring-primary/40 hover:shadow-md"
      }`}
    >
      {/* Top Banner Badge (Popular or Custom Plan Badge) */}
      {(plan.badge || isPopular) && (
        <div className="absolute top-0 right-0 z-20">
          <div className="rounded-bl-xl rounded-tr-xl bg-primary px-3.5 py-1 text-[11px] font-bold text-primary-foreground uppercase tracking-wider shadow-sm">
            {plan.badge || t("hosting.plan.popularFallback")}
          </div>
        </div>
      )}

      <div>
        {/* Banner/Thumbnail Header if available */}
        {plan.thumbnail_url && (
          <div className="w-full h-32 rounded-xl mb-5 overflow-hidden border border-border/50 bg-muted/30 relative">
            <img
              src={getImageUrl(plan.thumbnail_url)}
              alt={plan.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {plan.icon ? (
              <img
                src={getImageUrl(plan.icon)}
                alt={plan.name}
                className="size-10 rounded-xl object-contain p-1 border border-border bg-muted/40 shrink-0"
              />
            ) : (
              <div className="size-10 rounded-xl border border-border bg-muted/40 flex items-center justify-center font-bold text-sm text-muted-foreground shrink-0">
                {plan.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground truncate">{plan.name}</h3>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono">
                  {plan.slug}
                </span>
                {plan.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
                    {plan.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground min-h-[40px] mb-6">
          {plan.short_description || plan.description || t("hosting.plan.descFallback")}
        </p>

        <div className="mb-6">
          <span className="text-3xl sm:text-4xl font-extrabold text-foreground">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground font-medium">{t("hosting.perMonth")}</span>
        </div>

        {/* Specs Overview */}
        <div className="grid grid-cols-3 gap-2 py-3.5 mb-6 rounded-xl bg-muted text-center">
          <div>
            <div className="text-xs text-muted-foreground">{t("hosting.unitVcpu")}</div>
            <div className="font-bold text-sm text-foreground">{plan.cpu_limit} {t("hosting.unitCore")}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("hosting.unitRam")}</div>
            <div className="font-bold text-sm text-foreground">{plan.memory_limit} {t("hosting.unitMb")}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("hosting.unitDisk")}</div>
            <div className="font-bold text-sm text-foreground">{plan.disk_limit} {t("hosting.unitGb")}</div>
          </div>
        </div>

        {/* Feature List */}
        <ul className="space-y-3 text-sm text-muted-foreground mb-8">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>{t("hosting.imageLabel")} {plan.image_name}:{plan.image_tag}</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>{t("hosting.plan.webTerminalSsh")}</span>
          </li>
          {features.map((feat, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 pt-2">
        <Button
          variant={isPopular ? "default" : "secondary"}
          size="lg"
          className="w-full font-semibold cursor-pointer gap-2"
          onClick={() => onSelect(plan)}
        >
          <span>{t("hosting.buyDirect")}</span>
          <ArrowRight className="size-4" />
        </Button>

        {onAddToCart && (
          <Button
            variant="outline"
            size="sm"
            disabled={isAddingToCart}
            className="w-full text-xs font-semibold cursor-pointer gap-1.5"
            onClick={() => onAddToCart(plan)}
          >
            <ShoppingCart className="size-3.5" />
            <span>{t("hosting.addToCart")}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
