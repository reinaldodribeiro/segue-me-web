---
name: frontend-encounter-teams
description: "Pattern for the encounter team-building feature in the segue-me frontend. Covers
  EncounterTeamsContext, drag-and-drop team assembly, member management, team sync, and the
  coordinator slot validation. Use when working on encounter teams, DnD interactions, adding/removing
  team members, or the user says 'team builder', 'drag and drop', 'encounter teams', 'add member to team',
  'sync teams from movement'."
---
<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Encounter Teams Pattern

The encounter team builder is the most complex UI in the application. It uses a dedicated React context (`EncounterTeamsContext`) wrapping TanStack Query data, filter state, derived stats, and mutation actions. This avoids prop drilling across 6+ components in the DnD tree.

## Pattern

Architecture:
- `EncounterTeamsProvider` wraps the entire teams view
- TanStack Query loads teams and available people
- Context exports `EncounterTeamsContextData` interface and `EncounterTeamsContext`
- Hook `useEncounterTeams()` lives in `src/hooks/useEncounterTeams.ts` (NOT in context file)
- Context exposes actions: `syncTeams`, `addMember`, `removeMember`, `updateMemberStatus`
- Coordinator slot validation (youth vs couple limits) runs client-side before API call
- Filters: search, person type, and "worked in this team before" flag
- All view components use `SafeFC` pattern

Key rules:
- Always invalidate both `teams` and `availablePeople` queries after mutations
- Coordinator validation: check `coordinators_youth` and `coordinators_couples` limits
- `syncTeams` copies team templates from the movement to the encounter
- The `selectedTeamId` state determines which team receives drag-dropped members

## Component Tree

```
EncounterTeams (entry point, SafeFC)
  EncounterTeamsProvider (context)
    EncounterTeamsView (SafeFC)
      StatsBar (SafeFC)
      TeamMapGrid (SafeFC)
      PeoplePanel (SafeFC)
        DraggablePerson (SafeFC)
      AddMemberModal (SafeFC)
```

Ref: `src/context/EncounterTeamsContext.tsx`, `src/hooks/useEncounterTeams.ts`, `src/features/Encounters/Teams/`

## References

For full code examples:
-> Read `references/examples.md`
