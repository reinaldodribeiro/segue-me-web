import { Team, TeamMemberRole } from '@/interfaces/Encounter';

export interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  team: Team;
  role: TeamMemberRole;
}

export type AddMemberTab = 'available' | 'priorities' | 'suggestions';

export interface AISuggestion {
  person_id: string;
  reason: string;
}
