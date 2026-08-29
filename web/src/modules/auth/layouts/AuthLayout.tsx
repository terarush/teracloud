import React from "react"
import { Helmet } from "react-helmet-async"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"
import { BrandLogo } from "../components/elements/BrandLogo"
import { authContent } from "../content/auth"
import { companyMeta, getSeoMeta } from "@/meta"

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  useTranslation()
  const seo = getSeoMeta()
  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-12 bg-background">
      <Helmet>
        <title>{title ? `${title} — ${companyMeta.name}` : seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

        {/* Brand Panel — soft wheat, with subtle dot-grid workshop texture */}
        <div className="hidden md:flex md:col-span-5 lg:col-span-4 bg-secondary text-secondary-foreground flex-col justify-between p-12 relative overflow-hidden border-r border-border">

          {/* Workshop dot pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "radial-gradient(circle at 20px 20px, currentColor 1.5px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
            aria-hidden="true"
          />

          {/* Megaphone 3D Watermark Accent (Bottom-right background) */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 z-0 opacity-20 transform rotate-[-12deg] scale-125">
            <img
              src="/assets/ilustration/megaphone.png"
              alt=""
              className="h-80 w-auto object-contain select-none filter blur-[0.5px]"
            />
          </div>

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary-foreground text-sidebar-primary text-xs font-bold">
                {companyMeta.name.charAt(0) || "R"}
              </div>
              <span className="text-xl font-bold tracking-tight text-secondary-foreground">
                {companyMeta.name}
              </span>
            </Link>
          </div>

          <div className="space-y-6 relative z-10 my-auto">
            <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight leading-tight text-secondary-foreground">
              {authContent.brandPanel.headline}
            </h2>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              {authContent.brandPanel.subtitle}
            </p>

            <div className="pt-6 border-t border-border/20 space-y-3">
              <p className="text-xs italic leading-relaxed text-secondary-foreground/90">
                {authContent.brandPanel.quote}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-secondary-foreground/40 font-medium relative z-10">
            &copy; {new Date().getFullYear()} {companyMeta.name}. {authContent.brandPanel.copyright}
          </div>
        </div>

      {/* Form Panel */}
      <div className="col-span-1 md:col-span-7 lg:col-span-8 bg-background flex flex-col justify-center items-center py-12 px-6 sm:px-12 lg:px-24 relative">

        <div className="absolute top-6 left-6 md:left-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; {authContent.backToHome}
          </Link>
        </div>

        <div className="md:hidden mb-8 text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo />
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="bg-card ring-1 ring-foreground/10 shadow-xs rounded-xl p-8">
            {children}
          </div>
        </div>

      </div>

    </div>
  )
}
