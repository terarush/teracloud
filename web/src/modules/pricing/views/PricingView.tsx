import React from "react"
import { usePricing } from "../hooks/usePricing"
import { PlanCard } from "../components/PlanCard"
import { PlanComparison } from "../components/PlanComparison"
import { Loader2, ArrowLeft, Sun, Moon, Globe, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { useTheme } from "@/components/theme-provider"
import { companyMeta } from "@/meta"
import { useTranslation } from "react-i18next"
import { currentLocale, changeLocale } from "@/lib/i18n"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const PricingView: React.FC = () => {
  const { plans, isLoading, handleSelectPlan } = usePricing()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const activeLang = currentLocale()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Bar */}
      <header className="border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4" />
            {t("common.back", "Kembali ke Beranda")}
          </Button>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 px-3 gap-1.5 inline-flex items-center justify-center rounded-xl border border-border bg-background text-xs font-semibold hover:bg-muted hover:text-foreground cursor-pointer transition-colors outline-hidden">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="uppercase">{activeLang}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                <DropdownMenuItem onClick={() => changeLocale("id")} className="flex justify-between text-xs">
                  <span>Bahasa Indonesia</span>
                  {activeLang === "id" && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLocale("en")} className="flex justify-between text-xs">
                  <span>English (US)</span>
                  {activeLang === "en" && <Check className="w-3.5 h-3.5 text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            <Button size="sm" onClick={() => navigate({ to: "/app" })}>
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
            <div className="text-center py-16 bg-card border border-border rounded-2xl">
              <p className="text-muted-foreground">Belum ada paket hosting yang aktif saat ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
              {plans.map((plan, index) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onSelect={handleSelectPlan}
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
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xs">
              <PlanComparison />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {companyMeta.name}. All rights reserved.</p>
      </footer>
    </div>
  )
}
