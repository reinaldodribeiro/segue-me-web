'use client';

import { UserPlus, Trophy } from 'lucide-react';
import { PERSON_TYPE_LABELS } from '@/interfaces/Person';
import { personDisplayName, personInitials } from '@/utils/personDisplay';
import { storageUrl } from '@/utils/helpers';
import { PersonRowProps } from './types';
import { ENGAGEMENT_CONFIG } from './constants';

const PersonRow: SafeFC<PersonRowProps> = ({ person, onAdd, adding, aiReason, encounterYear }) => {
  const photo = person.photo ? storageUrl(person.photo) : null;
  const displayName = personDisplayName(person);
  const initials = personInitials(person);
  const { classes, Icon } = ENGAGEMENT_CONFIG[person.engagement_level];

  return (
    <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-hover/60 transition-colors">
      <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shrink-0 mt-0.5
        ${!photo ? (person.type === 'youth' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600') : ''}`}
      >
        {photo
          ? <img src={photo} alt={displayName} className="w-full h-full object-cover" />
          : initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-text truncate">{displayName}</p>
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${classes}`}>
            <Icon size={9} />
            <span className="capitalize">{person.engagement_level}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <p className="text-[10px] text-text-muted">{PERSON_TYPE_LABELS[person.type]}</p>
          {encounterYear && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
              <Trophy size={9} />
              {encounterYear}
            </span>
          )}
        </div>
        {aiReason && (
          <p className="text-[10px] text-primary/80 mt-1 leading-relaxed italic">✦ {aiReason}</p>
        )}
      </div>

      <button
        onClick={onAdd}
        disabled={adding}
        className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium mt-0.5
          bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <UserPlus size={12} />
        Adicionar
      </button>
    </div>
  );
};

export default PersonRow;
