import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Plan } from '../../service/teracloud';
import { PlanCard } from './components/PlanCard';
import { useNavigate } from '@tanstack/react-router';
import { Server, Zap, Shield, RefreshCw } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    teracloudApi
      .getPlans()
      .then((data) => setPlans(data || []))
      .catch((err) => console.error('Failed to load plans:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    try {
      const order = await teracloudApi.createOrder(plan.id);
      if (order.snap_redirect_url) {
        window.location.href = order.snap_redirect_url;
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal membuat order');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Pilihan Paket <span className="text-primary">Cloud Docker</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deploy container instan dengan persistent storage, full root access, dan web terminal interaktif.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                isPopular={index === 1}
              />
            ))}
          </div>
        )}

        {/* Feature Grid */}
        <div className="border-t border-border pt-16">
          <h2 className="text-2xl font-bold text-center mb-12">Fitur Unggulan Teracloud</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
              <Zap className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Deploy Instan</h3>
              <p className="text-sm text-muted-foreground">
                Container langsung siap dalam hitungan detik setelah pembayaran diverifikasi otomatis.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
              <Server className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Persistent Storage</h3>
              <p className="text-sm text-muted-foreground">
                Data Anda di direktori /home tetap aman tersimpan meskipun container di-restart atau di-reboot.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-card rounded-xl border border-border">
              <Shield className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Web Terminal & SSH</h3>
              <p className="text-sm text-muted-foreground">
                Akses terminal langsung dari browser dengan xterm.js atau via SSH client favorit Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
