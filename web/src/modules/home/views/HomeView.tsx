import { HeroSection } from "../components/HeroSection"
import { FeaturesSection } from "../components/FeaturesSection"
import { FAQSection } from "../components/FAQSection"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { ArrowRight, Moon, Sun } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { companyMeta } from "@/meta"
import { useTranslation } from "react-i18next"

export function HomeView() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="landing-theme min-h-screen bg-background text-foreground">
      <a href="#main-content" className="fixed left-4 top-3 z-[60] -translate-y-20 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform focus:translate-y-0">
        {t("nav.skipToContent")}
      </a>

      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button type="button" className="flex items-center gap-3 rounded-md" onClick={() => navigate({ to: "/" })} aria-label={t("nav.homeAria", { name: companyMeta.name })}>
            <img
              src={companyMeta.logo}
              alt={companyMeta.name}
              className="size-8 rounded-md object-contain shrink-0"
            />
            <span className="text-[15px] font-semibold tracking-[-0.02em]">{t("nav.brandName")}</span>
          </button>

          <nav aria-label={t("nav.mainNav")} className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <a href="#fitur" className="rounded-sm transition-colors hover:text-foreground">{t("nav.howItWorks")}</a>
            <button type="button" onClick={() => navigate({ to: "/pricing" })} className="rounded-sm transition-colors hover:text-foreground">{t("nav.pricing")}</button>
            <a href="#bantuan" className="rounded-sm transition-colors hover:text-foreground">{t("nav.help")}</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={theme === "dark" ? t("common.toggleLightTheme") : t("common.toggleDarkTheme")}
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate({ to: "/login" })}>{t("common.signIn")}</Button>
            <Button size="sm" className="px-3.5" onClick={() => navigate({ to: "/pricing" })}>{t("common.startDeploy")}</Button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <FAQSection />

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-end lg:justify-between lg:px-16">
              <div className="relative max-w-2xl">
                <p className="mb-3 text-xs font-semibold tracking-wider text-primary uppercase">{t("hosting.cta.eyebrow")}</p>
                <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl text-foreground">
                  {t("hosting.cta.title")}
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {t("hosting.cta.desc")}
                </p>
              </div>
              <Button size="lg" className="relative mt-8 h-11 gap-2 px-5 lg:mt-0 font-semibold" onClick={() => navigate({ to: "/pricing" })}>
                {t("common.viewPlans")} <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <img
              src={companyMeta.logo}
              alt={companyMeta.name}
              className="size-6 rounded-md object-contain shrink-0"
            />
            <span>© {new Date().getFullYear()} {t("nav.brandName")}</span>
          </div>
          <p>{t("hosting.footer.tagline")}</p>
          <a href={`mailto:${companyMeta.email}`} className="transition-colors hover:text-foreground">{companyMeta.email}</a>
        </div>
      </footer>
    </div>
  )
}
