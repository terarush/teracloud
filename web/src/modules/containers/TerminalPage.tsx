// File: web/src/modules/containers/TerminalPage.tsx
import React from 'react';
import { Terminal } from './components/Terminal';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

interface TerminalPageProps {
  containerId: number;
}

export const TerminalPage: React.FC<TerminalPageProps> = ({ containerId }) => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
        <button
          onClick={() =>
            navigate({
              to: '/app/dashboard/containers/$id',
              params: { id: String(containerId) },
            })
          }
          className="flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail Container</span>
        </button>
        <span className="text-xs font-mono text-slate-400">Teracloud Dedicated Web Terminal</span>
      </div>
      <div className="flex-1 p-4 overflow-hidden">
        <Terminal containerId={containerId} />
      </div>
    </div>
  );
};
