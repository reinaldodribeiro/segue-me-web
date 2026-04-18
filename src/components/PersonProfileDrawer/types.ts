import { Person, PersonHistory, PersonTeamExperience, TeamMemberStatus } from '@/interfaces/Person';

export interface PersonProfileDrawerProps {
  person: Person;
  experiences: PersonTeamExperience[];
  historyData: PersonHistory[];
  loadingExps: boolean;
  onClose: () => void;
  /** Optional: show the encounter status badge (used in MemberAvatar) */
  memberStatus?: TeamMemberStatus;
}
