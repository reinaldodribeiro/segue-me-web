import { Person, TeamMemberStatus } from './Person';
import { AcceptedType } from './Movement';

export type EncounterStatus = 'draft' | 'confirmed' | 'completed';

export const ENCOUNTER_STATUS_LABELS: Record<EncounterStatus, string> = {
  draft: 'Rascunho',
  confirmed: 'Confirmado',
  completed: 'Concluído',
};

export type TeamMemberRole = 'coordinator' | 'member';

export interface TeamMember {
  id: string;
  role: TeamMemberRole;
  role_label: string;
  status: TeamMemberStatus;
  status_label: string;
  refusal_reason: string | null;
  invited_at: string | null;
  responded_at: string | null;
  person?: Person;
}

export interface Team {
  id: string;
  movement_team_id: string | null;
  name: string;
  icon?: string | null;
  min_members: number;
  max_members: number;
  coordinators_youth: number;
  coordinators_couples: number;
  accepted_type: AcceptedType;
  accepted_type_label: string;
  recommended_skills: string[];
  order: number;
  members_count: number;
  confirmed_count: number;
  is_full: boolean;
  is_below_minimum: boolean;
  members?: TeamMember[];
}

export interface Encounter {
  id: string;
  name: string;
  edition_number: number | null;
  date: string | null;       // 'd/m/Y'
  end_date: string | null;   // 'd/m/Y'
  duration_days: number;
  location: string | null;
  status: EncounterStatus;
  status_label: string;
  max_participants: number | null;
  participants_count: number;
  has_analysis?: boolean;
  movement?: { id: string; name: string };
  responsible_user?: { id: string; name: string };
  teams?: Team[];
  created_at: string;
}

export interface EncounterParticipant {
  id: string;
  name: string;
  partner_name: string | null;
  type: import('./Person').PersonType;
  type_label: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;         // 'd/m/Y'
  partner_birth_date: string | null; // 'd/m/Y'
  photo: string | null;
  converted_to_person_id: string | null;
  is_converted: boolean;
  created_at: string;
}

export interface EncounterParticipantPayload {
  name: string;
  partner_name?: string | null;
  type: import('./Person').PersonType;
  phone?: string | null;
  email?: string | null;
  birth_date?: string | null;         // 'Y-m-d'
  partner_birth_date?: string | null; // 'Y-m-d'
}

export interface EncounterPayload {
  movement_id: string;
  name: string;
  edition_number?: number | null;
  date: string;              // 'Y-m-d' (start date)
  duration_days?: number;
  location?: string | null;
  responsible_user_id?: string | null;
  max_participants?: number | null;
}

export interface EncounterSummary {
  encounter_id: string;
  status: EncounterStatus;
  total_slots: number;
  total_filled: number;
  total_confirmed: number;
  total_pending: number;
  total_refused: number;
  teams: {
    id: string;
    name: string;
    min_members: number;
    max_members: number;
    total: number;
    confirmed: number;
    pending: number;
    refused: number;
    is_full: boolean;
    is_below_minimum: boolean;
  }[];
}
