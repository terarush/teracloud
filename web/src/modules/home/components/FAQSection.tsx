import React from "react"
import { homeFAQs } from "../content/homeContent"
import { useTranslation } from "react-i18next"

export const FAQSection: React.FC = () => {
  const { t } = useTranslation()
  return (
    <section id="bantuan" className="border-b border-border/70 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-16 lg:px-10">
        <div>
          <p className="mb-4 text-xs font-semibold tracking-[0.16em] text-primary">{t("hosting.faq.eyebrow")}</p>
          <h2 className="text-balance text-4xl font-semibold leading-none tracking-[-0.045em] sm:text-5xl">{t("hosting.faq.title")}</h2>
          <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">{t("hosting.faq.stillNeedHelp")} <a className="font-medium text-foreground underline decoration-border underline-offset-4 hover:text-primary" href="mailto:hello@terarush.studio">hello@terarush.studio</a>.</p>
        </div>

        <div className="border-t border-border">
          {homeFAQs.map((faq, idx) => (
            <article key={faq.question} className="grid gap-3 border-b border-border py-7 sm:grid-cols-[3rem_1fr] sm:gap-5">
              <span className="font-mono text-xs text-muted-foreground">0{idx + 1}</span>
              <div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{faq.question}</h3>
                <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
