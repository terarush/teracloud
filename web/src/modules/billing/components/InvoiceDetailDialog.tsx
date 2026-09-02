import React from "react"
import type { Invoice } from "@/service/api/billing"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { FileText, Calendar, CreditCard, Receipt } from "lucide-react"
import { useTranslation } from "react-i18next"

interface InvoiceDetailDialogProps {
  invoice: Invoice | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const InvoiceDetailDialog: React.FC<InvoiceDetailDialogProps> = ({
  invoice,
  open,
  onOpenChange,
}) => {
  const { t } = useTranslation()

  if (!invoice) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: invoice.currency || "IDR",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="md">
      <DialogContent showCloseButton showFullscreenButton={false}>
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-6">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Receipt className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold font-mono">
                  {invoice.invoice_number}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {t("hosting.billing.invoiceDetailSubtitle", "Rincian tagihan & pembayaran.")}
                </DialogDescription>
              </div>
            </div>
            <StatusBadge status={invoice.status} />
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/40">
            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t("hosting.date", "Tanggal Dibuat")}
              </span>
              <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="size-3 text-muted-foreground" />
                <span>{new Date(invoice.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            </div>

            <div>
              <span className="text-muted-foreground block text-[11px]">
                {t("hosting.dueDate", "Jatuh Tempo")}
              </span>
              <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="size-3 text-muted-foreground" />
                <span>
                  {invoice.due_date
                    ? new Date(invoice.due_date).toLocaleDateString("id-ID")
                    : "-"}
                </span>
              </div>
            </div>

            {invoice.paid_at && (
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  {t("hosting.billing.paidAt", "Waktu Pembayaran")}
                </span>
                <div className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                  <CreditCard className="size-3 text-primary" />
                  <span>{new Date(invoice.paid_at).toLocaleDateString("id-ID")}</span>
                </div>
              </div>
            )}

            {invoice.order_id && (
              <div>
                <span className="text-muted-foreground block text-[11px]">
                  {t("hosting.billing.orderId", "ID Pesanan")}
                </span>
                <span className="font-mono font-medium text-foreground mt-0.5 block">
                  #{invoice.order_id}
                </span>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground flex items-center gap-1.5">
              <FileText className="size-3.5 text-primary" />
              <span>{t("hosting.feature", "Rincian Tagihan")}</span>
            </h4>

            <div className="border border-border/50 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] font-medium border-b border-border/50">
                  <tr>
                    <th className="px-3 py-2">{t("hosting.billing.itemDescription", "Deskripsi")}</th>
                    <th className="px-3 py-2 text-center">{t("hosting.billing.qty", "Jml")}</th>
                    <th className="px-3 py-2 text-right">{t("hosting.billing.amount", "Nominal")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-foreground font-medium">{item.description}</td>
                        <td className="px-3 py-2 text-center text-muted-foreground">{item.qty}</td>
                        <td className="px-3 py-2 text-right font-medium text-foreground">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-3 py-2 text-foreground font-medium">
                        {t("hosting.orderConfirmText", "Langganan Container Hosting")}
                      </td>
                      <td className="px-3 py-2 text-center text-muted-foreground">1</td>
                      <td className="px-3 py-2 text-right font-medium text-foreground">
                        {formatCurrency(invoice.subtotal || invoice.total)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations */}
          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("hosting.subtotal", "Subtotal")}</span>
              <span className="font-medium text-foreground">{formatCurrency(invoice.subtotal || invoice.total)}</span>
            </div>
            {invoice.tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>{t("hosting.ppn", "PPN (11%)")}</span>
                <span className="font-medium text-foreground">{formatCurrency(invoice.tax)}</span>
              </div>
            )}
            <Separator className="my-2 bg-border/60" />
            <div className="flex justify-between text-sm font-bold text-foreground">
              <span>{t("hosting.total", "Total Tagihan")}</span>
              <span className="text-primary">{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </DialogBody>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
