'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { ACCEPTED_TYPE_LABELS } from '@/interfaces/Movement';
import { resolveTeamIcon } from '@/components/TeamIconPicker';
import { SortableTeamRowProps } from './types';

const SortableTeamRow: React.FC<SortableTeamRowProps> = ({
  team, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-hover/30 group bg-panel"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-hover shrink-0 touch-none"
        aria-label="Arrastar para reordenar"
      >
        <GripVertical size={14} className="text-text-muted/60" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {(() => { const Icon = resolveTeamIcon(team.icon); return Icon ? <Icon size={13} className="text-primary shrink-0" /> : null; })()}
          <p className="text-sm font-medium text-text">{team.name}</p>
        </div>
        <p className="text-xs text-text-muted">
          Coord.: {team.coordinators_youth} jovens · {team.coordinators_couples} casais
        </p>
        <p className="text-xs text-text-muted">
          Integrantes: {team.min_members}–{team.max_members} · {ACCEPTED_TYPE_LABELS[team.accepted_type]}
        </p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onMoveUp} disabled={isFirst} className="p-1 rounded hover:bg-hover disabled:opacity-30">
          <ChevronUp size={13} />
        </button>
        <button onClick={onMoveDown} disabled={isLast} className="p-1 rounded hover:bg-hover disabled:opacity-30">
          <ChevronDown size={13} />
        </button>
        <button onClick={onEdit} className="p-1 rounded hover:bg-hover text-xs text-text-muted">Editar</button>
        <button onClick={onDelete} className="p-1 rounded hover:bg-hover text-red-500">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
};

export default SortableTeamRow;
