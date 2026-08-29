import React from "react"
import type { Invoice } from "@/service/api/billing"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"

interface InvoiceTableProps {
  invoices: Invoice[]
  onSelectInvoice?: (invoice: Invoice) => void
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices, onSelectInvoice }) => {
  if (invoices.length === 0) {
    return (
      <div className="p-8 text-center bg-card border border-border rounded-2xl text-sm text-muted-foreground">
        Belum ada riwayat tagihan invoice.
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-4">Nomor Invoice</th>
              <th className="px-6 py-4">Tanggal</th>
              <th className="px-6 py-4">Jatuh Tempo</th>
              <th className="px-6 py-4">Total Tagihan</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {invoices.map((inv) => (
              <tr
                key={inv.id}
                onClick={() => onSelectInvoice?.(inv)}
                className="hover:bg-muted/30 transition cursor-pointer"
              >
                <td className="px-6 py-4 font-mono font-medium text-foreground">{inv.invoice_number}</td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {new Date(inv.created_at).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 text-xs text-muted-foreground">
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString("id-ID") : "-"}
                </td>
                <td className="px-6 py-4 font-bold text-foreground">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(inv.total)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={inv.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
