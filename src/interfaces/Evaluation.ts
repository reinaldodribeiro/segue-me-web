export type EvaluationStatus = 'pending' | 'submitted';
export type AnalysisStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type FulfilledResponsibilities = 'yes' | 'partially' | 'no';
export type RecommendStatus = 'yes' | 'with_reservations' | 'no';

export const EVALUATION_STATUS_LABELS: Record<EvaluationStatus, string> = {
  pending: 'Pendente',
  submitted: 'Submetida',
};

export const ANALYSIS_STATUS_LABELS: Record<AnalysisStatus, string> = {
  pending: 'Pendente',
  generating: 'Gerando',
  completed: 'Concluída',
  failed: 'Falhou',
};

export const FULFILLED_LABELS: Record<FulfilledResponsibilities, string> = {
  yes: 'Sim',
  partially: 'Parcialmente',
  no: 'Não',
};

export const RECOMMEND_LABELS: Record<RecommendStatus, string> = {
  yes: 'Sim',
  with_reservations: 'Com ressalvas',
  no: 'Não',
};

export interface TeamEvaluationToken {
  id: string;
  team_id: string;
  team_name: string;
  team_icon: string | null;
  token: string;
  pin: string;
  status: EvaluationStatus;
  status_label: string;
  submitted_at: string | null;
  expires_at: string | null;
  public_url: string;
}

export interface EvaluationFormData {
  encounter_name: string;
  encounter_date: string | null;
  movement_name: string | null;
  team_name: string;
  team_icon: string | null;
  already_submitted: boolean;
  members: {
    team_member_id: string;
    person_name: string;
  }[];
}

export interface MemberEvaluationPayload {
  team_member_id: string;
  commitment_rating: number;
  fulfilled_responsibilities: FulfilledResponsibilities;
  positive_highlight?: string;
  issue_observed?: string;
  recommend: RecommendStatus;
}

export interface EvaluationSubmission {
  session_token: string;
  preparation_rating: number;
  preparation_comment?: string;
  teamwork_rating: number;
  teamwork_comment?: string;
  materials_rating: number;
  materials_comment?: string;
  issues_text?: string;
  improvements_text?: string;
  overall_team_rating: number;
  members: MemberEvaluationPayload[];
}

export interface MemberEvaluationData {
  name: string;
  commitment_rating: number;
  fulfilled_responsibilities: FulfilledResponsibilities;
  recommend: RecommendStatus;
  positive_highlight: string | null;
  issue_observed: string | null;
}

export interface TeamEvaluationData {
  team_id: string;
  team_name: string;
  preparation_rating: number;
  preparation_comment: string | null;
  teamwork_rating: number;
  teamwork_comment: string | null;
  materials_rating: number;
  materials_comment: string | null;
  overall_team_rating: number;
  issues_text: string | null;
  improvements_text: string | null;
  members: MemberEvaluationData[];
}

export interface TeamAnalysisItem {
  team_id: string;
  team_name: string;
  analysis: string;
}

export interface EncounterAnalysis {
  id: string;
  general_analysis: string | null;
  status: AnalysisStatus;
  status_label: string;
  generated_at: string | null;
  team_analyses: TeamAnalysisItem[];
  team_evaluations: TeamEvaluationData[];
}

export interface EvaluationProgress {
  total_teams: number;
  submitted: number;
  pending: number;
  teams: {
    team_id: string;
    team_name: string;
    status: EvaluationStatus;
  }[];
}
