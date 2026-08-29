import React, { useEffect, useState } from 'react';
import { teracloudApi } from '../../service/teracloud';
import type { Container } from '../../service/teracloud';
import { Terminal } from './components/Terminal';
import { Play, Square, RotateCw, RefreshCcw, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface ContainerDetailPageProps {
  containerId: number;
}

export const ContainerDetailPage: React.FC<ContainerDetailPageProps> = ({ containerId }) => {
  const [container, setContainer] = useState<Container | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const navigate = useNavigate();

  const fetchContainer = () => {
    teracloudApi
      .getContainerById(containerId)
      .then((data) => setContainer(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchContainer();
  }, [containerId]);

  const handleAction = async (action: () => Promise<any>) => {
    setActionLoading(true);
    try {
      await action();
      fetchContainer();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Aksi gagal');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !container) {
    return <div className="p-8 text-center">Memuat detail container...</div>;
  }

  const assigned = container.assigned_ports || {};

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate({ to: '/app/dashboard' })}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard</span>
          </button>
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${
                container.status === 'running'
                  ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
              }`}
            >
              {container.status}
            </span>
          </div>
        </div>

        {/* Header Info */}
        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{container.container_name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Image: {container.image_name}:{container.image_tag} &bull; Hostname: {container.hostname}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {container.status === 'running' ? (
              <button
                disabled={actionLoading}
                onClick={() => handleAction(() => teracloudApi.stopContainer(container.id))}
                className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-xl text-sm font-medium transition"
              >
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                disabled={actionLoading}
                onClick={() => handleAction(() => teracloudApi.startContainer(container.id))}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition"
              >
                <Play className="w-4 h-4" />
                <span>Start</span>
              </button>
            )}

            <button
              disabled={actionLoading}
              onClick={() => handleAction(() => teracloudApi.restartContainer(container.id))}
              className="flex items-center space-x-1.5 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition"
            >
              <RotateCw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            <button
              disabled={actionLoading}
              onClick={() => handleAction(() => teracloudApi.resetContainer(container.id, 'soft'))}
              className="flex items-center space-x-1.5 px-3 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl text-sm font-medium transition"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>

            <button
              disabled={actionLoading}
              onClick={() => {
                if (confirm('Yakin ingin menghapus container ini dan semua datanya?')) {
                  handleAction(() => teracloudApi.deleteContainer(container.id)).then(() =>
                    navigate({ to: '/app/dashboard' })
                  );
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-sm font-medium transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        {/* Specs & Connection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold">Spesifikasi Alokasi</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-muted rounded-xl">
                <div className="text-xs text-muted-foreground">vCPU</div>
                <div className="text-lg font-bold">{container.cpu_limit} Core</div>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <div className="text-xs text-muted-foreground">RAM</div>
                <div className="text-lg font-bold">{container.memory_limit} MB</div>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <div className="text-xs text-muted-foreground">Storage</div>
                <div className="text-lg font-bold">{container.disk_limit} GB</div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <h2 className="text-lg font-semibold">Koneksi & Port Terbuka</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">SSH Access (Port 22):</span>
                <span className="font-mono font-medium">Port {assigned.ssh || 'None'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">HTTP Web (Port 80):</span>
                <span className="font-mono font-medium">Port {assigned.http || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Terminal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Web Terminal (xterm.js)</h2>
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              {showTerminal ? 'Tutup Terminal' : 'Buka Terminal'}
            </button>
          </div>

          {showTerminal && (
            <div className="h-96">
              <Terminal containerId={container.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
