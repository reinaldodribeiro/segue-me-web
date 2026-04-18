import { Encounter } from '@/interfaces/Encounter';

export interface EncounterReportsProps {
  encounters: Encounter[];
}

export interface RefusalItem {
  person_name: string;
  team_name: string;
  refusal_reason: string | null;
}
