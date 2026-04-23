'use client';

import { EncounterTeamsProvider } from '@/context/EncounterTeamsContext';
import { EncounterTeamsProps } from './types';
import EncounterTeamsView from './EncounterTeamsView';
import { useTutorial } from '@/hooks/useTutorial';

const EncounterTeams: React.FC<EncounterTeamsProps> = ({ encounterId }) => {
  useTutorial();
  return (
    <EncounterTeamsProvider encounterId={encounterId}>
      <EncounterTeamsView />
    </EncounterTeamsProvider>
  );
};

export default EncounterTeams;
