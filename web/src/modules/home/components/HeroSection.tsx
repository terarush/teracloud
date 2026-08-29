import React from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowRight, Server, Zap, Shield } from "lucide-react"

export const HeroSection: React.FC = () => {
  const navigate = useNavigate()

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            Teracloud Next-Gen Cloud Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl sm:leading-tight">
            Docker Container Hosting <span className="text-primary">Instan &amp; Fleksibel</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Jalankan container Docker pribadi dengan persistent NVMe storage, akses root penuh, web terminal interaktif di browser, dan monitoring realtime tanpa konfigurasi rumit.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto font-semibold gap-2 shadow-lg shadow-primary/25 cursor-pointer"
              onClick={() => navigate({ to: "/pricing" })}
            >
              Lihat Pilihan Paket
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto cursor-pointer"
              onClick={() => navigate({ to: "/app" })}
            >
              Masuk ke Console
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 border-y border-border/60 py-6 text-left">
            <div>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">&lt; 10s</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Provisioning Speed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">99.9%</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Uptime Guarantee</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground sm:text-3xl">100%</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Root Isolated Access</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
