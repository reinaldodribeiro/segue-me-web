import { Encounter } from '@/interfaces/Encounter';
import { Person } from '@/interfaces/Person';

export interface DashboardStats {
  totalPeople: number;
  peopleSample: Person[];
  avgScore: number;
  recentEncounters: Encounter[];
  totalEncounters: number;
}
