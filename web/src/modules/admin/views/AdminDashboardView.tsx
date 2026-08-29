import React from "react"
import { useAdminData } from "../hooks/useAdminData"
import { AdminStats } from "../components/AdminStats"
import { ArrowRight, Layers, ShoppingCart, Server, ScrollText, Terminal } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"

export const AdminDashboardView: React.FC = () => {
  const { stats, plans, containers, orders } = useAdminData()
  const navigate = useNavigate()

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Console</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
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
            desc: "Tambah, perbarui konfigurasi hardware, atau aktifkan paket container.",
            href: "/app/plans",
            icon: Layers,
          },
          {
            title: "Daftar Transaksi Pesanan",
            desc: "Pantau status verifikasi pembayaran Midtrans dari pengguna.",
            href: "/app/orders-list",
            icon: ShoppingCart,
          },
          {
            title: "Semua Container",
            desc: "Lihat seluruh container aktif milik semua pengguna platform.",
            href: "/app/admin/containers",
            icon: Server,
          },
          {
            title: "Log Audit Sistem",
            desc: "Riwayat aksi admin dan pengguna untuk kebutuhan audit trail.",
            href: "/app/admin/audit",
            icon: ScrollText,
          },
          {
            title: "Console Container User",
            desc: "Buka tampilan console pengguna untuk menguji provisioning.",
            href: "/app",
            icon: Terminal,
          },
        ].map((card) => {
          const Icon = card.icon
          return (
            <Card
              key={card.href}
              onClick={() => navigate({ to: card.href as any })}
              className="ring-1 ring-foreground/10 hover:ring-foreground/20 cursor-pointer transition-all group"
            >
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h3>
                  </div>
                  <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
