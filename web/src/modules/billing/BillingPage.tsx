// File: web/src/modules/billing/BillingPage.tsx
import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Subscription, Invoice } from '../../service/teracloud';
import { CreditCard, Calendar, FileText, CheckCircle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const BillingPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([teracloudApi.getSubscriptions(), teracloudApi.getInvoices()])
      .then(([subs, invs]) => {
        setSubscriptions(subs || []);
        setInvoices(invs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Langganan</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola langganan aktif, status perpanjangan, dan riwayat invoice pembayaran.
          </p>
        </div>

        {/* Subscriptions Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <span>Langganan Container Aktif</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
          ) : subscriptions.length === 0 ? (
            <div className="p-6 bg-card border border-border rounded-2xl text-center text-sm text-muted-foreground">
              Belum ada langganan aktif.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-6 bg-card border border-border rounded-2xl space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">Subscription #{sub.id}</h3>
                      <div className="text-xs text-muted-foreground">
                        Container ID: {sub.container_id || 'Sedang disiapkan'}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase ${
                        sub.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : sub.status === 'grace_period'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-rose-500/10 text-rose-500'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground pt-2 border-t border-border">
                    <div className="flex justify-between">
                      <span>Mulai Periode:</span>
                      <span className="font-medium text-foreground">
                        {new Date(sub.period_start).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Berakhir Pada:</span>
                      <span className="font-medium text-foreground">
                        {new Date(sub.period_end).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {sub.grace_period_end && (
                      <div className="flex justify-between text-amber-500">
                        <span>Batas Grace Period:</span>
                        <span>{new Date(sub.grace_period_end).toLocaleDateString('id-ID')}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invoices Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary" />
            <span>Riwayat Invoice & Pembayaran</span>
          </h2>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Nomor Invoice</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Total Tagihan</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Memuat invoice...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada riwayat invoice.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/30 transition">
                      <td className="px-6 py-4 font-mono font-medium">{inv.invoice_number}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(inv.total)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-500 uppercase">
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
