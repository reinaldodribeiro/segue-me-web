'use client';

import { StatCardProps } from './types';

const StatCard: SafeFC<StatCardProps> = ({ icon, label, value, iconBg, sub }) => {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text mt-0.5">
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
        {sub && <p className="text-[10px] text-text-muted/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

export default StatCard;
