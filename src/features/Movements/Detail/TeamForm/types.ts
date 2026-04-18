import { MovementTeam, MovementTeamPayload } from '@/interfaces/Movement';

export interface TeamFormProps {
  initial?: Partial<MovementTeam>;
  onSave: (d: MovementTeamPayload) => void;
  onCancel: () => void;
  saving?: boolean;
}
