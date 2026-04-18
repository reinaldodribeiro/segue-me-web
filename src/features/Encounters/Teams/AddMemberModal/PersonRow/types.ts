import { Person } from '@/interfaces/Person';

export interface PersonRowProps {
  person: Person;
  onAdd: () => void;
  adding: boolean;
  aiReason?: string;
  encounterYear?: number;
}
