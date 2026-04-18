'use client';

import { Users } from 'lucide-react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2 text-text-muted">
      <Users size={28} className="opacity-30" />
      <p className="text-sm">Nenhuma pessoa encontrada</p>
    </div>
  );
};

export default EmptyState;
