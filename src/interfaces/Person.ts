export type PersonType = 'youth' | 'couple';

export const PERSON_TYPE_LABELS: Record<PersonType, string> = {
  youth: 'Jovem',
  couple: 'Casal',
};

export type TeamMemberStatus = 'pending' | 'confirmed' | 'refused';

export const TEAM_MEMBER_STATUS_LABELS: Record<TeamMemberStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  refused: 'Recusado',
};

export type EngagementLevel = 'baixo' | 'medio' | 'alto' | 'destaque';

export const ENGAGEMENT_LEVEL_LABELS: Record<EngagementLevel, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  destaque: 'Destaque',
};

export interface Person {
  id: string;
  type: PersonType;
  parish_id?: string | null;
  parish?: { id: string; name: string } | null;
  type_label: string;
  name: string;
  partner_name: string | null;
  photo: string | null;
  birth_date: string | null;         // 'd/m/Y'
  partner_birth_date: string | null; // 'd/m/Y'
  wedding_date: string | null;       // 'd/m/Y'
  phones: string[];
  email: string | null;
  skills: string[];
  notes: string | null;
  engagement_score: number;
  engagement_level: EngagementLevel;
  active: boolean;
  encounter_year: number | null;
  created_at: string;

  // Common new fields
  nickname: string | null;
  address: string | null;
  birthplace: string | null;
  church_movement: string | null;
  received_at: string | null;        // 'd/m/Y'
  encounter_details: string | null;

  // Youth-only fields
  father_name: string | null;
  mother_name: string | null;
  education_level: string | null;
  education_status: string | null;   // 'Cursando' | 'Concluído' | 'Trancado'
  course: string | null;
  institution: string | null;
  sacraments: string[];              // ['batismo', 'eucaristia', 'crisma']
  available_schedule: string | null;
  musical_instruments: string | null;
  talks_testimony: string | null;

  // Couple-only fields
  partner_nickname: string | null;
  partner_birthplace: string | null;
  partner_email: string | null;
  partner_phones: string[];
  partner_photo: string | null;
  home_phones: string[];

  // Included on GET /encounters/{id}/available-people
  past_teams?: string[];
  past_movement_team_ids?: string[];
  recent_refusals_count?: number;
  consecutive_refusals_alert?: boolean;
  // Included only on GET /people/{id}
  history?: PersonHistory[];
  team_experiences?: PersonTeamExperience[];
}

export interface PersonPayload {
  type: PersonType;
  name: string;
  partner_name?: string | null;
  birth_date?: string | null;         // 'Y-m-d'
  partner_birth_date?: string | null; // 'Y-m-d'
  wedding_date?: string | null;       // 'Y-m-d'
  phones?: string[];
  email?: string | null;
  skills?: string[];
  notes?: string | null;
  encounter_year?: number | null;

  // Common new fields
  nickname?: string | null;
  address?: string | null;
  birthplace?: string | null;
  church_movement?: string | null;
  received_at?: string | null;        // 'Y-m-d'
  encounter_details?: string | null;

  // Youth-only fields
  father_name?: string | null;
  mother_name?: string | null;
  education_level?: string | null;
  education_status?: string | null;
  course?: string | null;
  institution?: string | null;
  sacraments?: string[];
  available_schedule?: string | null;
  musical_instruments?: string | null;
  talks_testimony?: string | null;

  // Couple-only fields
  partner_nickname?: string | null;
  partner_birthplace?: string | null;
  partner_email?: string | null;
  partner_phones?: string[];
  home_phones?: string[];
}

export type TeamExperienceRole = 'coordinator' | 'member';

export interface PersonTeamExperience {
  id: string;
  movement_team_id: string | null;
  team_name: string;
  team_icon: string | null;
  role: TeamExperienceRole;
  role_label: string;
  year: number | null;
}

export interface PersonHistoryEvaluation {
  commitment_rating: number;
  fulfilled_responsibilities: 'yes' | 'partially' | 'no';
  positive_highlight: string | null;
  issue_observed: string | null;
  recommend: 'yes' | 'with_reservations' | 'no';
}

export interface PersonHistory {
  id: string;
  status: TeamMemberStatus;
  status_label: string;
  refusal_reason: string | null;
  invited_at: string | null;
  responded_at: string | null;
  team: { id: string; name: string } | null;
  encounter: {
    id: string;
    name: string;
    edition_number: number | null;
    date: string | null;
    movement: { id: string; name: string } | null;
  } | null;
  evaluation: PersonHistoryEvaluation | null;
}
