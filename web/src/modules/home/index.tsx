import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "#/components/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { companyMeta } from "@/meta"

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleGetStarted = () => {
    navigate({ to: "/login" })
  }

  const logoSrc = theme === "dark" && companyMeta.logoWhite ? companyMeta.logoWhite : companyMeta.logo

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-6 transition-colors duration-200 relative">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        data-dev-source="src/modules/home/index.tsx"
        className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 transition-colors duration-200 cursor-pointer"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="max-w-md w-full text-center space-y-6">
        <img
          src={logoSrc}
          alt={companyMeta.name}
          data-dev-source="src/modules/home/index.tsx"
          className="mx-auto h-16 w-16 rounded-xl object-contain shadow-xs"
        />

        <div className="space-y-2">
          <p className="text-sm font-bold tracking-widest text-primary uppercase">
            Docker Host Cloud
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {companyMeta.name}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
            Deploy, manage, and run your Docker containers in the cloud instantly and securely.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button variant="default" onClick={() => navigate({ to: "/pricing" })} className="w-full sm:w-auto cursor-pointer">
            Lihat Paket Hosting
          </Button>
          <Button variant="outline" onClick={() => navigate({ to: "/dashboard" })} className="w-full sm:w-auto cursor-pointer">
            Masuk Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
