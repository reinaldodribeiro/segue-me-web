'use client';

import { UserPlus } from 'lucide-react';
import { EmptySlotProps } from './types';

const EmptySlot: React.FC<EmptySlotProps> = ({ onClick, overflowCount }) => {
  if (overflowCount !== undefined) {
    return (
      <div className="flex flex-col items-center gap-1 w-16">
        <button
          onClick={onClick}
          className="w-12 h-12 rounded-full border-2 border-dashed border-border flex items-center justify-center text-xs font-semibold text-text-muted hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
        >
          +{overflowCount}
        </button>
        <p className="text-[10px] text-text-muted/50">mais</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 w-16">
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-full border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center text-text-muted/30 hover:text-primary group"
      >
        <UserPlus size={16} className="transition-transform group-hover:scale-110" />
      </button>
      <p className="text-[10px] text-text-muted/40">vaga</p>
    </div>
  );
};

export default EmptySlot;
