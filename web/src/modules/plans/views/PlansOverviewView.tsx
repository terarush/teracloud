import { usePlansOverview } from "@/modules/plans/hooks/usePlansOverview"
import { useTranslation } from "react-i18next"
import { useCartQuery } from "@/service/query/cart"
import { useAddToCartMutation } from "@/service/mutation/cart"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import {
  ArrowRight,
  Check,
  ShoppingCart,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Plan } from "@/service/api/plans"

interface PlanCardProps {
  plan: Plan
  onSelect: (plan: Plan) => void
  onAddToCart: (plan: Plan) => void
  busy?: boolean
}

function PlanCard({ plan, onSelect, onAddToCart, busy }: PlanCardProps) {
  const { t } = useTranslation()
  const featured = Boolean(plan.badge || plan.is_featured)

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(plan.price_monthly)

  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <Card
      className={`flex flex-col justify-between ring-1 transition-colors overflow-hidden ${
        featured
          ? "ring-primary/40"
          : "ring-foreground/10 hover:ring-foreground/20"
      }`}
    >
      {/* Thumbnail Banner */}
      {plan.thumbnail_url && (
        <div className="w-full h-36 border-b border-border/50 bg-muted/30 relative overflow-hidden">
          <img
            src={getImageUrl(plan.thumbnail_url)}
            alt={plan.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardContent className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex items-start justify-between gap-3">
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
              <h3 className="truncate text-lg font-bold text-foreground">
                {plan.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground truncate">
                {plan.slug}
              </p>
            </div>
          </div>
          {featured && (
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide rounded-full bg-primary/10 px-2.5 py-1 text-primary">
              {plan.badge || t("hosting.plansTitleBadgePopular")}
            </span>
          )}
        </div>

        <p className="text-sm text-muted-foreground -mt-1">
          {plan.short_description || plan.description || t("hosting.plan.descFallback")}
        </p>

        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-extrabold text-foreground">
            {formattedPrice}
          </span>
          <span className="text-sm text-muted-foreground">
            {t("hosting.perMonth")}
          </span>
        </div>

        {/* Spec bar */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted py-3.5 text-center">
          <div>
            <div className="text-xs text-muted-foreground">{t("hosting.unitVcpu")}</div>
            <div className="font-bold text-sm text-foreground">
              {plan.cpu_limit} {t("hosting.unitCore")}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("hosting.unitRam")}</div>
            <div className="font-bold text-sm text-foreground">
              {plan.memory_limit} {t("hosting.unitMb")}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{t("hosting.unitDisk")}</div>
            <div className="font-bold text-sm text-foreground">
              {plan.disk_limit} {t("hosting.unitGb")}
            </div>
          </div>
        </div>

        {/* Feature list */}
        <ul className="space-y-2.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-primary" />
            <span>
              {t("hosting.imageLabel")} {plan.image_name}:{plan.image_tag}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="size-4 shrink-0 text-primary" />
            <span>{t("hosting.plan.webTerminalSsh")}</span>
          </li>
          {features.slice(0, 3).map((feat, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="size-4 shrink-0 text-primary" />
              <span className="truncate">{feat}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <div className="space-y-2 px-6 pb-6">
        <Button
          size="lg"
          className="w-full font-semibold cursor-pointer gap-2"
          onClick={() => onSelect(plan)}
        >
          <span>{t("hosting.buyDirect")}</span>
          <ArrowRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          className="w-full text-xs font-semibold cursor-pointer gap-1.5"
          onClick={() => onAddToCart(plan)}
        >
          <ShoppingCart className="size-3.5" />
          <span>{t("hosting.addToCart")}</span>
        </Button>
      </div>
    </Card>
  )
}

export const PlansOverviewView: React.FC = () => {
  const { t } = useTranslation()
  const { plans, isLoading, error, refetch, handleSelectPlan } = usePlansOverview()
  const navigate = useNavigate()
  const { data: cart } = useCartQuery()
  const addToCartMutation = useAddToCartMutation()

  const handleAddToCart = async (plan: Plan) => {
    try {
      await addToCartMutation.mutateAsync({
        plan_id: plan.id,
        duration_months: 1,
      })
      toast.success(t("hosting.addedToCartToast", { name: plan.name }), {
        action: {
          label: t("hosting.viewCart"),
          onClick: () => navigate({ to: "/app/cart" as any }),
        },
      })
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err?.message || t("hosting.cartAddFailed")
      )
    }
  }

  const totalCartItems =
    cart && Array.isArray(cart.items)
      ? cart.total_items || cart.items.length || 0
      : 0

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("hosting.plansTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("hosting.plansSubtitle")}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="relative gap-1.5 text-xs font-semibold cursor-pointer"
          onClick={() => navigate({ to: "/app/cart" as any })}
        >
          <ShoppingCart className="size-3.5" />
          <span className="hidden sm:inline">{t("nav.cart")}</span>
          {totalCartItems > 0 && (
            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {totalCartItems}
            </span>
          )}
        </Button>
      </div>

      {/* Body: loading / error / empty / grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-12 text-center space-y-3">
            <ShieldAlert className="size-10 mx-auto text-muted-foreground/30" />
            <div className="text-base font-semibold text-foreground">
              {t("hosting.plansLoadError")}
            </div>
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => refetch()}>
              {t("hosting.retry")}
            </Button>
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="ring-1 ring-foreground/10">
          <CardContent className="py-12 text-center space-y-3">
            <div className="text-base font-semibold text-foreground">
              {t("hosting.noActivePlans")}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              onAddToCart={handleAddToCart}
              busy={addToCartMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Full comparison link */}
      <div className="border-t border-border pt-6">
        <p className="text-sm text-muted-foreground">
          {t("hosting.plansCompareHint")}
          <button
            type="button"
            onClick={() => navigate({ to: "/pricing" })}
            className="ml-1.5 font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
          >
            {t("hosting.plansCompareLink")}
          </button>
        </p>
      </div>
    </div>
  )
}

export default PlansOverviewView