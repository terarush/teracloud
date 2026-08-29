// File: web/src/modules/admin/AdminOrders.tsx
import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Order } from '../../service/teracloud';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    teracloudApi
      .getUserOrders()
      .then((data) => setOrders(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => navigate({ to: '/app/admin' })}
          className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Admin Console</span>
        </button>

        <div>
          <h1 className="text-2xl font-bold">Semua Transaksi Order</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Riwayat seluruh pembelian dan status gateway pembayaran Midtrans.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Nomor Order</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Plan ID</th>
                <th className="px-6 py-4">Jumlah</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Memuat data order...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Belum ada order.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition">
                    <td className="px-6 py-4 font-mono font-medium">{o.order_number}</td>
                    <td className="px-6 py-4">User #{o.user_id}</td>
                    <td className="px-6 py-4">Plan #{o.plan_id}</td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(o.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                          o.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-500'
                            : 'bg-amber-500/10 text-amber-500'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
