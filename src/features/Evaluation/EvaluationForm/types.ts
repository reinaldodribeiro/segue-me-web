import { EvaluationFormData } from '@/interfaces/Evaluation';

export interface EvaluationFormProps {
  token: string;
  sessionToken: string;
  formData: EvaluationFormData;
  onSuccess: () => void;
}

export interface TeamFormState {
  preparation_rating: number;
  preparation_comment: string;
  teamwork_rating: number;
  teamwork_comment: string;
  materials_rating: number;
  materials_comment: string;
  issues_text: string;
  improvements_text: string;
  overall_team_rating: number;
}

export interface MemberFormState {
  team_member_id: string;
  person_name: string;
  commitment_rating: number;
  fulfilled_responsibilities: '' | 'yes' | 'partially' | 'no';
  positive_highlight: string;
  issue_observed: string;
  recommend: '' | 'yes' | 'with_reservations' | 'no';
}
