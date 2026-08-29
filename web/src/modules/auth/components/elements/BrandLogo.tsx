import { Link } from "@tanstack/react-router"
import { companyMeta } from "@/meta"
import { useTheme } from "@/components/theme-provider"

export function BrandLogo() {
  const { theme } = useTheme()
  const logoSrc = theme === "dark" && companyMeta.logoWhite ? companyMeta.logoWhite : companyMeta.logo

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group">
      <img
        src={logoSrc}
        alt={companyMeta.name}
        className="size-8 rounded-lg object-contain shrink-0"
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        {companyMeta.name}
      </span>
    </Link>
  )
}
