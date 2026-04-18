export type MovementScope = 'parish' | 'sector' | 'diocese';

export const MOVEMENT_SCOPE_LABELS: Record<MovementScope, string> = {
  parish: 'Paroquial',
  sector: 'Setorial',
  diocese: 'Diocesano',
};

export type AcceptedType = 'youth' | 'couple' | 'all';

export const ACCEPTED_TYPE_LABELS: Record<AcceptedType, string> = {
  youth: 'Jovens',
  couple: 'Casais',
  all: 'Todos',
};

export interface MovementTeam {
  id: string;
  movement_id: string;
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
  created_at: string;
}

export interface MovementTeamPayload {
  name: string;
  icon?: string | null;
  min_members: number;
  max_members: number;
  coordinators_youth: number;
  coordinators_couples: number;
  accepted_type: AcceptedType;
  recommended_skills?: string[];
}

export interface Movement {
  id: string;
  name: string;
  target_audience: AcceptedType;
  target_audience_label: string;
  scope: MovementScope;
  scope_label: string;
  description: string | null;
  active: boolean;
  teams_count?: number;
  teams?: MovementTeam[];
  created_at: string;
}

export interface MovementPayload {
  name: string;
  target_audience: AcceptedType;
  scope: MovementScope;
  description?: string | null;
  active?: boolean;
}
