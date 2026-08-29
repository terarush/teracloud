import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Container, Subscription } from '../../service/teracloud';
import { useNavigate } from '@tanstack/react-router';
import { Server, Plus, HardDrive, Cpu, Terminal, ArrowRight } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([teracloudApi.getUserContainers(), teracloudApi.getSubscriptions()])
      .then(([conts, subs]) => {
        setContainers(conts || []);
        setSubscriptions(subs || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const activeContainers = containers.filter((c) => c.status === 'running').length;

  return (
    <div className="min-h-screen bg-background text-foreground p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Cloud</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola container Docker, pantau status, dan perpanjang langganan Anda.
            </p>
          </div>
          <button
            onClick={() => navigate({ to: '/pricing' })}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Container Baru</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{containers.length}</div>
              <div className="text-xs text-muted-foreground">Total Container</div>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{activeContainers}</div>
              <div className="text-xs text-muted-foreground">Container Aktif</div>
            </div>
          </div>
          <div className="p-6 bg-card border border-border rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold">{subscriptions.length}</div>
              <div className="text-xs text-muted-foreground">Langganan Aktif</div>
            </div>
          </div>
        </div>

        {/* Containers List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Daftar Container Anda</h2>

          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Memuat container...</div>
          ) : containers.length === 0 ? (
            <div className="p-12 text-center bg-card border border-border rounded-2xl space-y-4">
              <Server className="w-12 h-12 text-muted-foreground mx-auto" />
              <div className="text-lg font-semibold">Belum Ada Container</div>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Anda belum memiliki container Docker aktif. Pilih paket dan mulai deploy sekarang.
              </p>
              <button
                onClick={() => navigate({ to: '/pricing' })}
                className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-xl text-sm"
              >
                Lihat Paket Hosting
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {containers.map((container) => (
                <div
                  key={container.id}
                  className="p-6 bg-card border border-border rounded-2xl flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg">{container.container_name}</h3>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase ${
                          container.status === 'running'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}
                      >
                        {container.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {container.image_name}:{container.image_tag}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground pt-2">
                      <span>{container.cpu_limit} vCPU</span>
                      <span>&bull;</span>
                      <span>{container.memory_limit} MB RAM</span>
                      <span>&bull;</span>
                      <span>{container.disk_limit} GB NVMe</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate({
                        to: `/app/dashboard/containers/$id`,
                        params: { id: String(container.id) },
                      })
                    }
                    className="flex items-center justify-center space-x-2 w-full py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium rounded-xl text-sm transition"
                  >
                    <span>Buka Panel & Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
