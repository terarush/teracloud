import React from "react"
import { useSearch, useNavigate, Link } from "@tanstack/react-router"
import { useOrderStatusQuery } from "@/service/query/orders"
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Server,
  Terminal,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Layers,
  Cpu,
  HardDrive
} from "lucide-react"

export const OrderStatusView: React.FC = () => {
  const search = useSearch({ strict: false }) as {
    order_id?: string
    status_code?: string
    transaction_status?: string
    mock_token?: string
  }

  const navigate = useNavigate()
  const rawOrderId = search.order_id || ""
  // Support if Midtrans sends "TERA-TC-xxx" or pure "TC-xxx"
  const cleanOrderNumber = rawOrderId.startsWith("TERA-") ? rawOrderId.replace("TERA-", "") : rawOrderId

  const { data: order, isLoading, isError, refetch } = useOrderStatusQuery(cleanOrderNumber, !!cleanOrderNumber)

  const isPaid = order?.status === "paid" || search.transaction_status === "settlement" || search.transaction_status === "capture"
  const isFailed = order?.status === "failed" || search.transaction_status === "deny" || search.transaction_status === "expire"

  const items = order?.items || []

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      {/* Header Status Banner */}
      <div className="text-center space-y-3">
        {isPaid ? (
          <div className="inline-flex items-center justify-center p-3.5 bg-primary/10 text-primary rounded-2xl ring-1 ring-primary/20">
            <CheckCircle2 className="size-10 stroke-[2.2]" />
          </div>
        ) : isFailed ? (
          <div className="inline-flex items-center justify-center p-3.5 bg-destructive/10 text-destructive rounded-2xl ring-1 ring-destructive/20">
            <AlertCircle className="size-10 stroke-[2.2]" />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center p-3.5 bg-muted text-muted-foreground rounded-2xl ring-1 ring-foreground/10 animate-pulse">
            <Clock className="size-10 stroke-[2.2]" />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {isPaid
            ? "Pembayaran Berhasil Diverifikasi!"
            : isFailed
            ? "Pembayaran Gagal atau Kadaluarsa"
            : "Menunggu Konfirmasi Pembayaran..."}
        </h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Order ID: <span className="font-mono font-medium text-foreground">{rawOrderId || "N/A"}</span>
          {order?.paid_at && ` • Dibayar pada ${new Date(order.paid_at).toLocaleString("id-ID")}`}
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="bg-card ring-1 ring-foreground/10 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
          <Layers className="size-4 text-primary" /> Status Provisioning Container
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Payment */}
          <div className={`p-4 rounded-xl ring-1 transition-all ${isPaid ? "bg-primary/5 ring-primary/30" : "bg-muted/30 ring-foreground/10"}`}>
            <div className="flex items-center gap-3">
              <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${isPaid ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"}`}>
                {isPaid ? <CheckCircle2 className="size-4" /> : "1"}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Pembayaran</div>
                <div className="text-[11px] text-muted-foreground">{isPaid ? "Terverifikasi" : "Menunggu Midtrans"}</div>
              </div>
            </div>
          </div>

          {/* Step 2: Resource Allocation */}
          <div className={`p-4 rounded-xl ring-1 transition-all ${isPaid ? "bg-primary/5 ring-primary/30" : "bg-muted/30 ring-foreground/10"}`}>
            <div className="flex items-center gap-3">
              <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${isPaid ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"}`}>
                {isPaid ? <CheckCircle2 className="size-4" /> : "2"}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Alokasi Resource & Port</div>
                <div className="text-[11px] text-muted-foreground">{isPaid ? "Storage & IP Terpasang" : "Menunggu Pembayaran"}</div>
              </div>
            </div>
          </div>

          {/* Step 3: Container Running */}
          <div className={`p-4 rounded-xl ring-1 transition-all ${isPaid ? "bg-primary/5 ring-primary/30" : "bg-muted/30 ring-foreground/10"}`}>
            <div className="flex items-center gap-3">
              <div className={`size-7 rounded-full flex items-center justify-center text-xs font-bold ${isPaid ? "bg-primary text-primary-foreground" : "bg-muted-foreground/30 text-muted-foreground"}`}>
                {isPaid ? <CheckCircle2 className="size-4" /> : "3"}
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Container Active</div>
                <div className="text-[11px] text-muted-foreground">{isPaid ? "Siap Digunakan" : "Menunggu Antrean"}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Item Containers */}
      {items.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Server className="size-5 text-primary" /> Container yang Dipesan ({items.length})
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card ring-1 ring-foreground/10 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-foreground">
                      {item.custom_name || item.plan?.name || `Container Plan #${item.plan_id}`}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-primary/10 text-primary">
                      {item.duration_months} Bulan
                    </span>
                  </div>

                  {item.plan && (
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Cpu className="size-3.5" /> {item.plan.cpu_limit} Core
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="size-3.5" /> {item.plan.memory_limit} MB RAM
                      </span>
                      <span>OS: {item.plan.image_name}:{item.plan.image_tag}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-muted-foreground">Subtotal</div>
                    <div className="text-sm font-bold text-foreground">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <RotateCcw className="size-4" /> Refresh Status
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/app/containers"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Server className="size-4" /> Buka Dashboard Container <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
