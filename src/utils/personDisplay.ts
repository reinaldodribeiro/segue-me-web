import { Person } from '@/interfaces/Person';
import { TeamMember } from '@/interfaces/Encounter';

/** Full display name: "Elias & Rayanne" for couples, just name for youth.
 *  If nickname is provided the main name is shown as "Nome (Apelido)". */
export function personDisplayName(person: Pick<Person, 'name' | 'partner_name' | 'type'> & { nickname?: string | null }): string {
  const mainName = person.nickname ? `${person.name} (${person.nickname})` : person.name;
  if (person.type === 'couple' && person.partner_name) {
    return `${mainName} & ${person.partner_name}`;
  }
  return mainName;
}

/** Avatar initials: "ER" for couples, "E" for youth */
export function personInitials(person: Pick<Person, 'name' | 'partner_name' | 'type'>): string {
  if (person.type === 'couple' && person.partner_name) {
    return `${person.name[0]}${person.partner_name[0]}`.toUpperCase();
  }
  return person.name[0].toUpperCase();
}

/** Same helpers but from a TeamMember (person may be undefined) */
export function memberDisplayName(member: TeamMember): string {
  if (!member.person) return '—';
  return personDisplayName(member.person);
}

export function memberInitials(member: TeamMember): string {
  if (!member.person) return '?';
  return personInitials(member.person);
}
