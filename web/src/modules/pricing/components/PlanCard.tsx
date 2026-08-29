import React from 'react';
import type { Plan } from '../../../service/teracloud';
import { Check, Cpu, HardDrive, MemoryStick } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isPopular?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isPopular }) => {
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(plan.price_monthly);

  return (
    <div
      className={`relative flex flex-col p-6 bg-card rounded-2xl border transition-all hover:shadow-lg ${
        isPopular ? 'border-primary shadow-primary/10 shadow-md ring-1 ring-primary' : 'border-border'
      }`}
    >
      {isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow">
          Paling Populer
        </span>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.short_description}</p>
      </div>

      <div className="mb-6">
        <span className="text-3xl font-extrabold text-foreground">{formattedPrice}</span>
        <span className="text-muted-foreground text-sm font-medium"> /bulan</span>
      </div>

      <div className="space-y-3 mb-6 flex-1 text-sm">
        <div className="flex items-center space-x-2 text-foreground">
          <Cpu className="w-4 h-4 text-primary" />
          <span>{plan.cpu_limit} vCPU Core</span>
        </div>
        <div className="flex items-center space-x-2 text-foreground">
          <MemoryStick className="w-4 h-4 text-primary" />
          <span>{plan.memory_limit} MB RAM</span>
        </div>
        <div className="flex items-center space-x-2 text-foreground">
          <HardDrive className="w-4 h-4 text-primary" />
          <span>{plan.disk_limit} GB Storage NVMe</span>
        </div>
        <div className="flex items-center space-x-2 text-foreground">
          <span className="text-xs px-2 py-0.5 bg-muted rounded font-mono">
            {plan.image_name}:{plan.image_tag}
          </span>
        </div>

        {Array.isArray(plan.features) && plan.features.length > 0 && (
          <div className="pt-2 border-t border-border space-y-2">
            {plan.features.map((feature, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-2.5 px-4 rounded-xl font-medium transition ${
          isPopular
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        Pilih Paket
      </button>
    </div>
  );
};
