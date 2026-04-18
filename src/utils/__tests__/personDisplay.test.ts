import {
  personDisplayName,
  personInitials,
  memberDisplayName,
  memberInitials,
} from '../personDisplay';
import type { Person } from '@/interfaces/Person';
import type { TeamMember } from '@/interfaces/Encounter';

type PersonStub = Pick<Person, 'name' | 'partner_name' | 'type'>;

describe('personDisplayName', () => {
  it('returns "Name & PartnerName" for couple with partner_name', () => {
    const person: PersonStub = { name: 'Ana', partner_name: 'Carlos', type: 'couple' };
    expect(personDisplayName(person)).toBe('Ana & Carlos');
  });

  it('returns just name for couple without partner_name', () => {
    const person: PersonStub = { name: 'Ana', partner_name: null, type: 'couple' };
    expect(personDisplayName(person)).toBe('Ana');
  });

  it('returns just name for youth type', () => {
    const person: PersonStub = { name: 'João', partner_name: null, type: 'youth' };
    expect(personDisplayName(person)).toBe('João');
  });
});

describe('personInitials', () => {
  it('returns first letters of both names uppercased for couple', () => {
    const person: PersonStub = { name: 'Ana', partner_name: 'Carlos', type: 'couple' };
    expect(personInitials(person)).toBe('AC');
  });

  it('returns first letter uppercased for youth', () => {
    const person: PersonStub = { name: 'joão', partner_name: null, type: 'youth' };
    expect(personInitials(person)).toBe('J');
  });

  it('returns first letter of name only for couple without partner_name', () => {
    const person: PersonStub = { name: 'Maria', partner_name: null, type: 'couple' };
    expect(personInitials(person)).toBe('M');
  });
});

describe('memberDisplayName', () => {
  it('returns em dash when member has no person', () => {
    const member = { person: undefined } as unknown as TeamMember;
    expect(memberDisplayName(member)).toBe('—');
  });

  it('delegates to personDisplayName when member has a person', () => {
    const member = {
      person: { name: 'Elias', partner_name: 'Rayanne', type: 'couple' } as Person,
    } as TeamMember;
    expect(memberDisplayName(member)).toBe('Elias & Rayanne');
  });
});

describe('memberInitials', () => {
  it('returns "?" when member has no person', () => {
    const member = { person: undefined } as unknown as TeamMember;
    expect(memberInitials(member)).toBe('?');
  });

  it('delegates to personInitials when member has a person', () => {
    const member = {
      person: { name: 'Elias', partner_name: 'Rayanne', type: 'couple' } as Person,
    } as TeamMember;
    expect(memberInitials(member)).toBe('ER');
  });
});
