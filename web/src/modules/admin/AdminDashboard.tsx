import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Plan, Container, Order } from '../../service/teracloud';
import { Users, Server, DollarSign, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const AdminDashboard: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      teracloudApi.getPlans(),
      teracloudApi.getUserContainers(),
      teracloudApi.getUserOrders(),
    ])
      .then(([p, c, o]) => {
        setPlans(p || []);
        setContainers(c || []);
        setOrders(o || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status === 'paid')
    .reduce((acc, o) => acc + o.amount, 0);

  const formattedRevenue = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(totalRevenue);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan performa sistem, manajemen paket hosting, dan pemantauan transaksi.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold">{formattedRevenue}</div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold">{containers.length}</div>
              <div className="text-xs text-muted-foreground">Active Containers</div>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold">{orders.length}</div>
              <div className="text-xs text-muted-foreground">Total Orders</div>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl font-bold">{plans.length}</div>
              <div className="text-xs text-muted-foreground">Hosting Plans</div>
            </div>
          </div>
        </div>

        {/* Quick Admin Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            onClick={() => navigate({ to: '/app/admin/plans' })}
            className="p-6 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary transition group"
          >
            <h3 className="font-bold text-lg group-hover:text-primary transition flex items-center justify-between">
              <span>Kelola Paket Hosting</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Tambah, edit, atau nonaktifkan paket hosting container Docker.
            </p>
          </div>

          <div
            onClick={() => navigate({ to: '/app/dashboard' })}
            className="p-6 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary transition group"
          >
            <h3 className="font-bold text-lg group-hover:text-primary transition flex items-center justify-between">
              <span>Lihat Semua Container</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Pantau status realtime dan alokasi resource semua user.
            </p>
          </div>

          <div
            onClick={() => navigate({ to: '/pricing' })}
            className="p-6 bg-card border border-border rounded-2xl cursor-pointer hover:border-primary transition group"
          >
            <h3 className="font-bold text-lg group-hover:text-primary transition flex items-center justify-between">
              <span>Halaman Publik Pricing</span>
              <ArrowRight className="w-4 h-4" />
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Lihat tampilan penawaran paket hosting dari sisi pelanggan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
