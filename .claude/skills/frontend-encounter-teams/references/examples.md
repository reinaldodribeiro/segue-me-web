<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Encounter Teams Examples

## EncounterTeamsProvider setup
Ref: `src/features/Encounters/Teams/index.tsx`
```tsx
const EncounterTeams: React.FC<{ encounterId: string }> = ({ encounterId }) => {
  return (
    <EncounterTeamsProvider encounterId={encounterId}>
      <EncounterTeamsView />
    </EncounterTeamsProvider>
  );
};
```

## Context value shape (what components consume)
Ref: `src/context/EncounterTeamsContext.tsx`
```ts
interface EncounterTeamsContextValue {
  encounterId: string;
  teams: Team[];
  available: Person[];
  filteredAvailable: Person[];
  loadingTeams: boolean;
  selectedTeamId: string | null;
  // Stats
  totalSlots: number;
  totalFilled: number;
  totalConfirmed: number;
  teamsComplete: number;
  // Actions
  syncTeams: () => Promise<void>;
  addMember: (personId: string, role: TeamMemberRole, teamId?: string) => Promise<void>;
  removeMember: (memberId: string, reason?: string) => Promise<void>;
  updateMemberStatus: (memberId: string, status: TeamMemberStatus, refusalReason?: string) => Promise<void>;
}
```

## Coordinator slot validation (client-side)
Ref: `src/context/EncounterTeamsContext.tsx`
```ts
async function addMember(personId: string, role: TeamMemberRole, teamId?: string) {
  const target = teamId ?? selectedTeamId;
  if (!target) return;

  if (role === 'coordinator') {
    const person = available.find((p) => p.id === personId);
    const team = teams.find((t) => t.id === target);

    if (person && team) {
      const activeCoords = (team.members ?? []).filter(
        (m) => m.role === 'coordinator' && m.status !== 'refused',
      );
      if (person.type === 'youth') {
        const filled = activeCoords.filter((m) => m.person?.type === 'youth').length;
        if (filled >= team.coordinators_youth) {
          toast({ title: 'Limite de coordenadores jovem atingido.', variant: 'error' });
          return;
        }
      }
    }
  }

  await EncounterService.addMember(target, personId, role);
  invalidateAll();
}
```

## Cache invalidation pattern
Ref: `src/context/EncounterTeamsContext.tsx`
```ts
function invalidateAll() {
  queryClient.invalidateQueries({ queryKey: queryKeys.encounters.teams(encounterId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.encounters.availablePeople(encounterId) });
}
```
