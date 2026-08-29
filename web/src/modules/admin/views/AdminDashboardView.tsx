import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { AdminStats } from "../components/AdminStats"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

export const AdminDashboardView: React.FC = () => {
  const { stats, plans, containers, orders } = useAdminData()
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "Kelola Paket Hosting",
            desc: "Tambah, perbarui konfigurasi hardware, atau aktifkan/nonaktifkan paket container.",
            href: "/app/plans",
          },
          {
            title: "Daftar Transaksi Pesanan",
            desc: "Pantau status verifikasi pembayaran Midtrans dari pengguna.",
            href: "/app/orders-list",
          },
          {
            title: "Semua Container",
            desc: "Lihat seluruh container aktif milik semua pengguna platform.",
            href: "/app/admin/containers",
          },
          {
            title: "Log Audit Sistem",
            desc: "Riwayat aksi admin dan pengguna untuk kebutuhan audit trail.",
            href: "/app/admin/audit",
          },
          {
            title: "Console Container User",
            desc: "Buka tampilan console pengguna untuk menguji provisioning dan terminal.",
            href: "/app",
          },
        ].map((card) => (
          <div
            key={card.href}
            onClick={() => navigate({ to: card.href as any })}
            className="p-6 bg-card ring-1 ring-foreground/10 rounded-xl cursor-pointer hover:ring-primary/40 transition group"
          >
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition flex items-center justify-between">
              <span>{card.title}</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-xs text-muted-foreground mt-2">{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
