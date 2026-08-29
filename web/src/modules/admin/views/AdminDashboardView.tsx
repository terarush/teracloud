import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { AdminStats } from "../components/AdminStats"
import { ArrowRight, Server, ShoppingCart, Layers, ShieldAlert, Activity } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

export const AdminDashboardView: React.FC = () => {
  const { stats, plans, containers, orders, auditLogs } = useAdminData()
  const navigate = useNavigate()

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Console</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pusat kontrol sistem, alokasi paket hosting, pemantauan pesanan, dan log audit.
        </p>
      </div>

      <AdminStats
        stats={stats}
        planCount={plans.length}
        containerCount={containers.length}
        orderCount={orders.length}
      />

      {/* Navigation Quick Access */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div
          onClick={() => navigate({ to: "/app/plans" })}
          className="p-6 bg-card border border-border rounded-3xl cursor-pointer hover:border-primary/50 transition group shadow-xs"
        >
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition flex items-center justify-between">
            <span>Kelola Paket Hosting</span>
            <ArrowRight className="w-4 h-4" />
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Tambah, perbarui konfigurasi hardware, atau aktifkan/nonaktifkan paket container.
          </p>
        </div>

        <div
          onClick={() => navigate({ to: "/app/orders-list" })}
          className="p-6 bg-card border border-border rounded-3xl cursor-pointer hover:border-primary/50 transition group shadow-xs"
        >
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition flex items-center justify-between">
            <span>Daftar Transaksi Pesanan</span>
            <ArrowRight className="w-4 h-4" />
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Pantau status verifikasi pembayaran Midtrans dari pengguna.
          </p>
        </div>

        <div
          onClick={() => navigate({ to: "/app" })}
          className="p-6 bg-card border border-border rounded-3xl cursor-pointer hover:border-primary/50 transition group shadow-xs"
        >
          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition flex items-center justify-between">
            <span>Console Container User</span>
            <ArrowRight className="w-4 h-4" />
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Buka tampilan console pengguna untuk menguji provisioning dan terminal.
          </p>
        </div>
      </div>
    </div>
  )
}
