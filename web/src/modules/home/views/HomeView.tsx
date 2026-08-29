import React from "react"
import { HeroSection } from "../components/HeroSection"
import { FeaturesSection } from "../components/FeaturesSection"
import { FAQSection } from "../components/FAQSection"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { Sun, Moon, Server, Terminal, Shield, ArrowRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { companyMeta } from "@/meta"

export function HomeView() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate({ to: "/" })}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black shadow-md shadow-primary/25">
              TC
            </div>
            <span className="font-extrabold text-lg tracking-tight">{companyMeta.name}</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <button onClick={() => navigate({ to: "/" })} className="hover:text-foreground transition">
              Beranda
            </button>
            <button onClick={() => navigate({ to: "/pricing" })} className="hover:text-foreground transition">
              Harga &amp; Paket
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground hover:bg-muted transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/login" })}>
              Masuk
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/pricing" })}>
              Mulai Sekarang
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <FAQSection />

        {/* Bottom CTA Banner */}
        <section className="py-20 bg-primary/5 border-t border-primary/10">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              Siap Menjalankan Container Docker Anda?
            </h2>
            <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto">
              Daftar sekarang dan nikmati keleluasaan hosting container dengan alokasi resource dedicated.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" className="font-semibold gap-2" onClick={() => navigate({ to: "/pricing" })}>
                Pilih Paket Sekarang
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {companyMeta.name}. All rights reserved.</p>
      </footer>
    </div>
  )
}
