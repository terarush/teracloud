import React from "react"
import { usePricing } from "../hooks/usePricing"
import { PlanCard } from "../components/PlanCard"
import { PlanComparison } from "../components/PlanComparison"
import { Loader2, ArrowLeft, Sun, Moon, Globe, Check, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider"
import { useCartQuery } from "@/service/query/cart"
import { useAddToCartMutation } from "@/service/mutation/cart"
import { companyMeta } from "@/meta"
import { useTranslation } from "react-i18next"
import { currentLocale, changeLocale } from "@/lib/i18n"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Plan } from "@/service/api/plans"

export const PricingView: React.FC = () => {
  const { plans, isLoading, handleSelectPlan } = usePricing()
  const { data: cart } = useCartQuery()
  const addToCartMutation = useAddToCartMutation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const activeLang = currentLocale()

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
      toast.error(err?.message || t("hosting.cartAddFailed"))
    }
  }

  const totalCartItems = cart ? (cart.total_items || cart.items.length || 0) : 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="gap-2 cursor-pointer" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.back", "Kembali ke Beranda")}
          </Button>

          <div className="flex items-center gap-3">
            {/* Cart Header Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/app/cart" as any })}
              className="relative gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ShoppingCart className="size-3.5" />
              <span className="hidden sm:inline">{t("nav.cart")}</span>
              {totalCartItems > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalCartItems}
                </span>
              )}
            </Button>

            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 px-3 gap-1.5 inline-flex items-center justify-center rounded-xl border border-border bg-background text-xs font-semibold hover:bg-muted hover:text-foreground cursor-pointer transition-colors outline-hidden">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="uppercase">{activeLang}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem onClick={() => changeLocale("id")} className="flex justify-between text-xs cursor-pointer">
                  <span>{t("nav.languageLabelId")}</span>
                  {activeLang === "id" && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale("en")} className="flex justify-between text-xs cursor-pointer">
                  <span>{t("nav.languageLabelEn")}</span>
                  {activeLang === "en" && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted transition cursor-pointer"
              aria-label={t("nav.toggleTheme")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <Button size="sm" onClick={() => navigate({ to: "/app" })} className="cursor-pointer">
              {t("hosting.dashboard", "Console")}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Pricing */}
      <main className="flex-1 py-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              {t("hosting.pricingTitle", "Pilihan Paket Docker Hosting")}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {t("hosting.pricingSubtitle", "Pilih spesifikasi cloud container yang sesuai dengan kebutuhan deployment bot, backend API, database, atau web service Anda.")}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
              <p>{t("common.loading", "Memuat daftar paket...")}</p>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16 bg-card ring-1 ring-foreground/10 rounded-xl">
              <p className="text-muted-foreground">{t("hosting.noActivePlans")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelectPlan}
                  onAddToCart={handleAddToCart}
                  isAddingToCart={addToCartMutation.isPending}
                  isPopular={index === 1 || plan.slug.includes("standard")}
                />
              ))}
            </div>
          )}

          {/* Plan Feature Matrix */}
          <div className="border-t border-border pt-16">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold">{t("hosting.comparisonTitle", "Matriks Perbandingan Fitur")}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("hosting.comparisonSubtitle", "Detail perbandingan resource dan fitur untuk setiap tingkatan paket")}
              </p>
            </div>
            <div className="bg-card ring-1 ring-foreground/10 rounded-xl p-6">
              <PlanComparison />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {companyMeta.name}. {t("hosting.allRightsReserved")}</p>
      </footer>
    </div>
  )
}
