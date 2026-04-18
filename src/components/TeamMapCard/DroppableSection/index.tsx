'use client';

import { useDroppable } from '@dnd-kit/core';
import { DroppableSectionProps } from './types';

const DroppableSection: React.FC<DroppableSectionProps> = ({ id, label, icon, filled, total, children }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl p-3 transition-all ${isOver ? 'bg-primary/8 ring-2 ring-primary/30 ring-inset' : 'bg-hover/20'}`}
    >
      <div className={`flex items-center justify-between mb-3 transition-colors ${isOver ? 'text-primary' : 'text-text-muted'}`}>
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          filled >= total && total > 0
            ? 'bg-green-100 text-green-700'
            : filled > 0
              ? 'bg-amber-100 text-amber-700'
              : 'bg-hover text-text-muted'
        }`}>
          {filled}/{total}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
  );
};

export default DroppableSection;
