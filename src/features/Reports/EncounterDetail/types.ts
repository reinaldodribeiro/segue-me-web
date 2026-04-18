import type { Encounter, EncounterSummary } from '@/interfaces/Encounter';
import type { EncounterAnalysis } from '@/interfaces/Evaluation';

export interface EncounterDetailProps {
  encounters: Encounter[];
}

export interface RefusalItem {
  person_name: string;
  team_name: string;
  refusal_reason: string | null;
}

export interface DetailState {
  summary: EncounterSummary | null;
  analysis: EncounterAnalysis | null;
  refusals: RefusalItem[] | null;
  loadingSummary: boolean;
  loadingAnalysis: boolean;
  loadingRefusals: boolean;
}
