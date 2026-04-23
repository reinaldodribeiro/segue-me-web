import { useContext } from 'react';
import { EncounterTeamsContext, EncounterTeamsContextData } from '@/context/EncounterTeamsContext';

export function useEncounterTeams(): EncounterTeamsContextData {
  const context = useContext(EncounterTeamsContext);
  if (!context) throw new Error('useEncounterTeams must be used within EncounterTeamsProvider');
  return context;
}
