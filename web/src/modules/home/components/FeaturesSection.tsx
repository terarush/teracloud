import React from "react"
import { homeFeatures } from "../content/homeContent"
import { Zap, HardDrive, Terminal, Activity, ShieldCheck, CreditCard } from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  Zap: <Zap className="h-6 w-6 text-primary" />,
  HardDrive: <HardDrive className="h-6 w-6 text-primary" />,
  Terminal: <Terminal className="h-6 w-6 text-primary" />,
  Activity: <Activity className="h-6 w-6 text-primary" />,
  ShieldCheck: <ShieldCheck className="h-6 w-6 text-primary" />,
  CreditCard: <CreditCard className="h-6 w-6 text-primary" />,
}

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-20 bg-muted/30 border-y border-border/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold uppercase tracking-wider text-primary">Fitur Unggulan</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Dibangun untuk Developer &amp; Sysadmin
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Infrastruktur handal dengan isolasi tingkat kernel, kemudahan manajemen, dan integrasi modern.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {homeFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="p-8 bg-card border border-border/70 rounded-2xl shadow-xs hover:border-primary/50 transition duration-200"
            >
              <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-5">
                {iconMap[feature.icon] || <Zap className="h-6 w-6 text-primary" />}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
