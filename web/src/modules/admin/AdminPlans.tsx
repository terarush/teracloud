// File: web/src/modules/admin/AdminPlans.tsx
import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Plan } from '../../service/teracloud';
import { Plus, Edit, Trash2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPlans = () => {
    teracloudApi
      .getPlans()
      .then((data) => setPlans(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/app/admin' })}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Admin Console</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manajemen Paket Hosting</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Daftar paket Docker hosting yang tersedia untuk dibeli oleh user.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Nama Paket</th>
                  <th className="px-6 py-4">Image Docker</th>
                  <th className="px-6 py-4">Resource Alokasi</th>
                  <th className="px-6 py-4">Harga / Bulan</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Memuat daftar paket...
                    </td>
                  </tr>
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      Belum ada paket hosting.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-muted/30 transition">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {plan.name}
                        <div className="text-xs text-muted-foreground font-normal">
                          {plan.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {plan.image_name}:{plan.image_tag}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {plan.cpu_limit} vCPU &bull; {plan.memory_limit} MB RAM &bull;{' '}
                        {plan.disk_limit} GB NVMe
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(plan.price_monthly)}
                      </td>
                      <td className="px-6 py-4">
                        {plan.is_active ? (
                          <span className="inline-flex items-center text-emerald-500 text-xs font-medium space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-rose-500 text-xs font-medium space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Nonaktif</span>
                          </span>
                        )}
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
