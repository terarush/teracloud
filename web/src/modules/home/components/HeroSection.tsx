import React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Activity, ArrowRight, Database, Terminal } from "lucide-react"
import { useTranslation } from "react-i18next"

export const HeroSection: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const metrics = [
    { value: "08.4s", label: t("hosting.home.metrics.avgDeploy") },
    { value: "99.95%", label: t("hosting.home.metrics.uptime30d") },
    { value: "24/7", label: t("hosting.home.metrics.terminalAccess") },
  ]

  return (
    <section className="relative isolate overflow-hidden border-b border-border/70 pb-16 pt-12 sm:pb-24 sm:pt-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10">
        <div>
          <div className="mb-6 flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span>{t("hosting.home.badge")}</span>
          </div>

          <h1 className="max-w-2xl text-balance text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground">
            {t("hosting.home.heroTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t("hosting.home.heroDesc")}
          </p>

          <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="h-11 w-full gap-2 px-5 font-semibold sm:w-auto"
              onClick={() => navigate({ to: "/pricing" })}
            >
              {t("hosting.home.choosePlan")}
              <ArrowRight className="size-4" />
            </Button>
            <button
              type="button"
              onClick={() => navigate({ to: "/app" })}
              className="group inline-flex h-11 items-center gap-2 px-1 text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {t("hosting.home.openConsole")}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </button>
          </div>

          <div className="mt-14 grid max-w-xl grid-cols-3 border-t border-border/80 pt-6">
            {metrics.map((metric) => (
              <div key={metric.label} className="border-l border-border/80 pl-4 first:border-l-0 first:pl-0 sm:pl-6">
                <p className="font-mono text-lg font-semibold tabular-nums text-foreground sm:text-xl">{metric.value}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground sm:text-xs">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="absolute -left-6 -top-6 hidden items-center gap-2 border border-border bg-background px-3 py-2 text-xs font-medium text-foreground sm:flex">
            <Activity className="size-3.5 text-primary" />
            {t("hosting.home.allSystemsNormal")}
          </div>

          <div className="overflow-hidden rounded-2xl bg-[oklch(0.16_0.016_190)] text-white ring-1 ring-foreground/15">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="size-2 rounded-full bg-primary" />
                <span className="font-mono text-xs text-white/70">{t("hosting.home.terminal.window")}</span>
              </div>
              <span className="border border-white/15 px-2 py-1 font-mono text-[10px] text-white/55">{t("hosting.home.terminal.runStatus")}</span>
            </div>

            <div className="p-5 sm:p-7">
              <div className="mb-7 grid grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/10">
                {[
                  [t("hosting.home.stat.cpuLabel"), "0.42 vCPU"],
                  [t("hosting.home.stat.ramLabel"), "386 MB"],
                  [t("hosting.home.stat.diskLabel"), "7.8 GB"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-[oklch(0.18_0.018_190)] px-3 py-4">
                    <p className="text-[9px] tracking-[0.18em] text-white/35">{label}</p>
                    <p className="mt-1.5 font-mono text-xs font-medium tabular-nums text-white/85 sm:text-sm">{value}</p>
                  </div>
                ))}
              </div>

              <div className="font-mono text-[11px] leading-6 text-white/55 sm:text-xs">
                <p><span className="text-primary">$</span> docker pull ghcr.io/teraspace/api:stable</p>
                <p className="text-white/35">stable: Pulling from teraspace/api</p>
                <p className="text-white/35">Digest: sha256:73fa...91c2</p>
                <p className="text-white/80"><span className="text-primary">✓</span> Image ready in 2.1s</p>
                <p className="mt-3"><span className="text-primary">$</span> container start --port 8080</p>
                <p className="text-white/80"><span className="text-primary">✓</span> Listening on 0.0.0.0:8080</p>
                <p className="mt-3 flex items-center gap-2 text-white/40"><span className="inline-block h-3 w-1.5 animate-pulse bg-primary" /> ready</p>
              </div>
            </div>
          </div>

          <div className="ml-auto mt-3 grid w-[88%] grid-cols-2 gap-3 sm:absolute sm:-bottom-8 sm:-right-5 sm:mt-0 sm:w-[78%]">
            <div className="flex items-center gap-3 rounded-lg bg-card p-3.5 ring-1 ring-foreground/10">
              <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary"><Database className="size-4" /></div>
              <div><p className="text-[10px] text-muted-foreground">{t("hosting.home.stat.volumeLabel")}</p><p className="text-xs font-semibold">{t("hosting.home.stat.volumeValue")}</p></div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-card p-3.5 ring-1 ring-foreground/10">
              <div className="flex size-8 items-center justify-center rounded-md bg-secondary text-primary"><Terminal className="size-4" /></div>
              <div><p className="text-[10px] text-muted-foreground">{t("hosting.home.stat.accessLabel")}</p><p className="text-xs font-semibold">{t("hosting.home.stat.accessValue")}</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
