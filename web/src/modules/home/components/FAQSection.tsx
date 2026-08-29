import React from "react"
import { homeFAQs } from "../content/homeContent"

export const FAQSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-base font-semibold uppercase tracking-wider text-primary">FAQ</h2>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Pertanyaan yang Sering Diajukan
          </p>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-border">
          {homeFAQs.map((faq, idx) => (
            <div key={idx} className="py-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
