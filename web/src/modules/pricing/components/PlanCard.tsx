import React from "react"
import type { Plan } from "@/service/api/plans"
import { Button } from "@/components/ui/button"
import { Check, Zap, Server, Shield } from "lucide-react"

interface PlanCardProps {
  plan: Plan
  onSelect: (plan: Plan) => void
  isPopular?: boolean
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular = false }) => {
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(plan.price_monthly)

  const features = Array.isArray(plan.features) ? plan.features : []

  return (
    <div
      className={`relative flex flex-col justify-between p-8 rounded-3xl transition-all duration-200 ${
        isPopular
          ? "bg-card border-2 border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/20 scale-105 z-10"
          : "bg-card border border-border/80 hover:border-primary/40 shadow-xs"
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground uppercase tracking-widest shadow-md">
          Paling Populer
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-muted text-muted-foreground font-mono">
            {plan.slug}
          </span>
        </div>

        <p className="text-sm text-muted-foreground min-h-[40px] mb-6">
          {plan.short_description || plan.description || "Solusi hosting container docker berperforma tinggi."}
        </p>

        <div className="mb-6">
          <span className="text-4xl font-extrabold text-foreground">{formattedPrice}</span>
          <span className="text-sm text-muted-foreground font-medium"> / bulan</span>
        </div>

        {/* Specs Overview */}
        <div className="grid grid-cols-3 gap-2 py-4 mb-6 rounded-2xl bg-muted/50 border border-border/50 text-center">
          <div>
            <div className="text-xs text-muted-foreground">vCPU</div>
            <div className="font-bold text-sm text-foreground">{plan.cpu_limit} Core</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">RAM</div>
            <div className="font-bold text-sm text-foreground">{plan.memory_limit} MB</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Disk</div>
            <div className="font-bold text-sm text-foreground">{plan.disk_limit} GB</div>
          </div>
        </div>

        {/* Feature List */}
        <ul className="space-y-3 text-sm text-muted-foreground mb-8">
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>Image: {plan.image_name}:{plan.image_tag}</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>Web Terminal (xterm.js) &amp; SSH Port</span>
          </li>
          <li className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span>Maksimal {plan.max_per_user} container per user</span>
          </li>
          {features.map((feat, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={isPopular ? "default" : "outline"}
        size="lg"
        className="w-full font-semibold cursor-pointer"
        onClick={() => onSelect(plan)}
      >
        Pilih Paket
      </Button>
    </div>
  )
}
