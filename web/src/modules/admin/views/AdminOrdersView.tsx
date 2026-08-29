import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { StatusBadge } from "@/modules/containers/components/StatusBadge"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useNavigate } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

export const AdminOrdersView: React.FC = () => {
  const { orders, isLoading } = useAdminData()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/app/console" })}
            className="gap-1 mb-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer -ml-2 h-7"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t("common.back", "Kembali ke Console")}</span>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("hosting.adminOrders", "Daftar Transaksi Pesanan (Orders)")}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Log seluruh transaksi pembelian dan langganan hosting pengguna.
          </p>
        </div>
      </div>

      <Card className="ring-1 ring-foreground/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 border-b border-border/50 text-muted-foreground text-[11px] font-medium uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">{t("hosting.invoiceNumber", "Nomor Order")}</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Plan ID</th>
                <th className="px-4 py-3">{t("hosting.total", "Total Tagihan")}</th>
                <th className="px-4 py-3">{t("hosting.status", "Status")}</th>
                <th className="px-4 py-3">{t("hosting.date", "Waktu")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                    <span className="text-xs">{t("common.loading", "Memuat daftar transaksi...")}</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted-foreground">
                    Belum ada transaksi pesanan yang tercatat.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-foreground">
                      {order.order_number}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      #{order.user_id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                      #{order.plan_id}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(order.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
