'use client';

import { useState } from 'react';
import { Crown, Users } from 'lucide-react';
import { resolveTeamIcon } from '@/components/TeamIconPicker';
import { useEncounterTeams } from '@/hooks/useEncounterTeams';
import MemberAvatar from '@/components/MemberAvatar';
import EmptySlot from '@/components/EmptySlot';
import AddMemberModal from '@/features/Encounters/Teams/AddMemberModal';
import { TeamMemberRole } from '@/interfaces/Encounter';
import { TeamMapCardProps } from './types';
import DroppableSection from './DroppableSection';

const TeamMapCard: SafeFC<TeamMapCardProps> = ({ team }) => {
  const { selectedTeamId, setSelectedTeamId } = useEncounterTeams();
  const isSelected = selectedTeamId === team.id;
  const [slotModal, setSlotModal] = useState<TeamMemberRole | null>(null);

  const allActive = (team.members ?? []).filter((m) => m.status !== 'refused');
  const coordinators = allActive.filter((m) => m.role === 'coordinator');
  const members = allActive.filter((m) => m.role === 'member');

  const totalCoordSlots = team.coordinators_youth + team.coordinators_couples;
  const totalMemberSlots = Math.max(0, team.max_members - totalCoordSlots);

  const emptyCoords = Math.max(0, totalCoordSlots - coordinators.length);
  const emptyMembers = Math.max(0, totalMemberSlots - members.length);

  const fillPct = team.max_members > 0 ? Math.min(100, (allActive.length / team.max_members) * 100) : 0;

  const showCoord = totalCoordSlots > 0 || coordinators.length > 0;
  const showMembers = totalMemberSlots > 0 || members.length > 0;

  function handleSelect() {
    setSelectedTeamId(team.id);
  }

  // Style variants
  const cardBorder = isSelected
    ? 'border-primary ring-2 ring-primary/20'
    : team.is_full
      ? 'border-green-300'
      : team.is_below_minimum
        ? 'border-red-300'
        : 'border-border';

  const headerBg = isSelected
    ? 'bg-primary/5'
    : 'bg-panel';

  const barColor = team.is_full
    ? 'bg-green-500'
    : team.is_below_minimum
      ? 'bg-red-400'
      : 'bg-primary';

  return (
    <div className={`border-2 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md ${cardBorder} ${isSelected ? 'shadow-primary/10' : ''}`}>

      {/* Header */}
      <div
        className={`px-4 pt-4 pb-3 cursor-pointer transition-colors hover:brightness-95 ${headerBg}`}
        onClick={handleSelect}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {(() => { const Icon = resolveTeamIcon(team.icon); return Icon ? <Icon size={15} className="text-primary shrink-0" /> : null; })()}
            <h3 className="font-bold text-base text-text leading-tight">{team.name}</h3>
          </div>
          <div className="flex gap-1 shrink-0 flex-wrap justify-end">
            {isSelected && (
              <span className="text-[10px] bg-primary text-white font-semibold px-2 py-0.5 rounded-full">
                Selecionada
              </span>
            )}
            {team.is_full ? (
              <span className="text-[10px] bg-green-500 text-white font-semibold px-2 py-0.5 rounded-full">
                ✓ Completa
              </span>
            ) : team.is_below_minimum ? (
              <span className="text-[10px] bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                Incompleta
              </span>
            ) : null}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Crown size={11} className="text-amber-500" />
            <span className="text-blue-500 font-semibold">{team.coordinators_youth}J</span>
            <span>·</span>
            <span className="text-violet-500 font-semibold">{team.coordinators_couples}C</span>
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1">
            <Users size={11} />
            {allActive.length}/{team.max_members} membros
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-hover">
        <div className={`h-full ${barColor} transition-all duration-500`} style={{ width: `${fillPct}%` }} />
      </div>

      {/* Sections */}
      <div className="p-3 bg-panel space-y-2">
        {showCoord && (
          <DroppableSection
            id={`${team.id}--coordinator`}
            label="Coordenadores"
            icon={<Crown size={12} />}
            filled={coordinators.length}
            total={totalCoordSlots}
          >
            {coordinators.map((m) => (
              <MemberAvatar key={m.id} member={m} />
            ))}
            {Array.from({ length: emptyCoords }).map((_, i) => (
              <EmptySlot key={i} onClick={() => setSlotModal('coordinator')} />
            ))}
          </DroppableSection>
        )}

        {showMembers && (
          <DroppableSection
            id={`${team.id}--member`}
            label="Integrantes"
            icon={<Users size={12} />}
            filled={members.length}
            total={totalMemberSlots}
          >
            {members.map((m) => (
              <MemberAvatar key={m.id} member={m} />
            ))}
            {Array.from({ length: emptyMembers }).map((_, i) => (
              <EmptySlot key={i} onClick={() => setSlotModal('member')} />
            ))}
          </DroppableSection>
        )}
      </div>

      <AddMemberModal
        open={!!slotModal}
        onClose={() => setSlotModal(null)}
        team={team}
        role={slotModal ?? 'member'}
      />
    </div>
  );
};

export default TeamMapCard;
