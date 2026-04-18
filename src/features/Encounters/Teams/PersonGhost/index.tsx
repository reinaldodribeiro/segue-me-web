'use client';

import { personDisplayName, personInitials } from '@/utils/personDisplay';
import { PersonGhostProps } from './types';

const PersonGhost: React.FC<PersonGhostProps> = ({ person }) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-panel border border-primary shadow-lg w-44">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
        ${person.type === 'youth' ? 'bg-blue-100 text-blue-600' : 'bg-violet-100 text-violet-600'}`}
      >
        {personInitials(person)}
      </div>
      <p className="text-xs font-medium text-text truncate">{personDisplayName(person)}</p>
    </div>
  );
};

export default PersonGhost;
