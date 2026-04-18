'use client';

import { RefreshCw, Users } from 'lucide-react';
import Button from '@/components/Button';
import TeamMapCard from '@/components/TeamMapCard';
import { useEncounterTeams } from '@/context/EncounterTeamsContext';

const TeamMapGrid: React.FC = () => {
  const { teams, loadingTeams, syncing, syncTeams } = useEncounterTeams();

  if (loadingTeams) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted gap-2">
        <RefreshCw size={16} className="animate-spin" />
        <span className="text-sm">Carregando equipes...</span>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3 bg-panel border border-border rounded-xl">
        <Users size={36} className="text-text-muted/30" />
        <div>
          <p className="text-sm font-medium text-text-muted">Nenhuma equipe encontrada</p>
          <p className="text-xs text-text-muted/70 mt-1">Sincronize as equipes-modelo do movimento para começar</p>
        </div>
        <Button size="sm" leftIcon={<RefreshCw size={13} />} loading={syncing} onClick={syncTeams}>
          Sincronizar equipes do movimento
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {teams.map((team) => (
        <TeamMapCard key={team.id} team={team} />
      ))}
    </div>
  );
};

export default TeamMapGrid;
