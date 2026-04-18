import { MovementTeam } from '@/interfaces/Movement';

export interface SortableTeamRowProps {
  team: MovementTeam;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}
