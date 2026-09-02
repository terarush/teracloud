import React from "react"
import type { Invoice } from "@/service/api/billing"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { Card, CardContent } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { useTranslation } from "react-i18next"

interface InvoiceTableProps {
  invoices: Invoice[]
  onSelectInvoice?: (invoice: Invoice) => void
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onSelectInvoice }) => {
  const { t } = useTranslation()

  if (invoices.length === 0) {
    return (
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="py-12 text-center">
          <FileText className="size-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">{t("hosting.noInvoices", "Belum ada riwayat tagihan invoice.")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="ring-1 ring-foreground/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">{t("hosting.invoiceNumber", "Nomor Invoice")}</th>
              <th className="px-4 py-3">{t("hosting.date", "Tanggal")}</th>
              <th className="px-4 py-3">{t("hosting.dueDate", "Jatuh Tempo")}</th>
              <th className="px-4 py-3">{t("hosting.total", "Total Tagihan")}</th>
              <th className="px-4 py-3">{t("hosting.status", "Status")}</th>
              <th className="px-4 py-3 text-right">{t("hosting.actions", "Aksi")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => onSelectInvoice?.(inv)}
                className="hover:bg-muted/40 transition cursor-pointer"
              >
                <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(inv.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString("id-ID") : "-"}
                </td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: inv.currency || "IDR",
                    maximumFractionDigits: 0,
                  }).format(inv.total)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs font-medium text-primary hover:underline">
                    {t("hosting.billing.viewDetail", "Lihat Detail")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
