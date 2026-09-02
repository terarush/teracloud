import React from "react"
import { pricingComparisonList } from "../content/pricingContent"
import { Check, Minus } from "lucide-react"
import { useTranslation } from "react-i18next"

export const PlanComparison: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground uppercase text-xs">
            <th className="py-4 px-6 font-semibold">{t("hosting.feature")}</th>
            <th className="py-4 px-6 font-semibold text-center">{t("hosting.featureComparison.starter")}</th>
            <th className="py-4 px-6 font-semibold text-center text-primary">{t("hosting.featureComparison.standard")}</th>
            <th className="py-4 px-6 font-semibold text-center">{t("hosting.featureComparison.pro")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {pricingComparisonList.map((item, idx) => (
            <tr key={idx} className="hover:bg-muted/30 transition">
              <td className="py-4 px-6 font-medium text-foreground">{item.feature}</td>
              <td className="py-4 px-6 text-center text-muted-foreground">
                {typeof item.starter === "boolean" ? (
                  item.starter ? (
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted mx-auto" />
                  )
                ) : (
                  item.starter
                )}
              </td>
              <td className="py-4 px-6 text-center font-medium text-foreground">
                {typeof item.standard === "boolean" ? (
                  item.standard ? (
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted mx-auto" />
                  )
                ) : (
                  item.standard
                )}
              </td>
              <td className="py-4 px-6 text-center text-muted-foreground">
                {typeof item.pro === "boolean" ? (
                  item.pro ? (
                    <Check className="h-4 w-4 text-primary mx-auto" />
                  ) : (
                    <Minus className="h-4 w-4 text-muted mx-auto" />
                  )
                ) : (
                  item.pro
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
