import { Link } from "@tanstack/react-router"
import { companyMeta } from "@/meta"

export function BrandLogo() {
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group">
      <img
        src={companyMeta.logo}
        alt={companyMeta.name}
        className="h-9 w-auto dark:brightness-0 dark:invert"
      />
      <span className="text-xl font-bold tracking-tight text-foreground">
        {companyMeta.name}
      </span>
    </Link>
  )
}
