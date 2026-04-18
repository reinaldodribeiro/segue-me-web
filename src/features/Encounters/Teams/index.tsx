'use client';

import { EncounterTeamsProvider } from '@/context/EncounterTeamsContext';
import { EncounterTeamsProps } from './types';
import EncounterTeamsView from './EncounterTeamsView';

const EncounterTeams: React.FC<EncounterTeamsProps> = ({ encounterId }) => {
  return (
    <EncounterTeamsProvider encounterId={encounterId}>
      <EncounterTeamsView />
    </EncounterTeamsProvider>
  );
};

export default EncounterTeams;
