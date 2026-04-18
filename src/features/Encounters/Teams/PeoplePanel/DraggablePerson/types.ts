import { Person } from '@/interfaces/Person';

export interface DraggablePersonProps {
  person: Person;
  selected: boolean;
  onAdd: () => void;
  onInfo: () => void;
}
