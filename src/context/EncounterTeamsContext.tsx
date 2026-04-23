'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useDebounce } from '@/hooks/useDebounce';
import { Team, TeamMemberRole } from '@/interfaces/Encounter';
import { Person, TeamMemberStatus } from '@/interfaces/Person';
import EncounterService from '@/services/api/EncounterService';
import { useEncounterTeams as useEncounterTeamsQuery, useEncounterAvailablePeople } from '@/lib/query/hooks/useEncounters';
import { queryKeys } from '@/lib/query/keys';

interface EncounterTeamsContextValue {
  encounterId: string;
  // Data
  teams: Team[];
  available: Person[];
  filteredAvailable: Person[];
  loadingTeams: boolean;
  loadingPeople: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  totalAvailable: number;
  syncing: boolean;
  selectedTeamId: string | null;
  selectedTeam: Team | undefined;
  searchPeople: string;
  filterType: string;
  filterWorkedInTeam: boolean;
  // Stats
  totalSlots: number;
  totalFilled: number;
  totalConfirmed: number;
  teamsComplete: number;
  // Setters
  setSelectedTeamId: (id: string | null) => void;
  setSearchPeople: (s: string) => void;
  setFilterType: (s: string) => void;
  setFilterWorkedInTeam: (v: boolean) => void;
  // Pagination
  fetchNextPage: () => void;
  // Actions
  syncTeams: () => Promise<void>;
  addMember: (personId: string, role: TeamMemberRole, teamId?: string) => Promise<void>;
  removeMember: (memberId: string, reason?: string) => Promise<void>;
  updateMemberStatus: (memberId: string, status: TeamMemberStatus, refusalReason?: string) => Promise<void>;
}

const EncounterTeamsContext = createContext<EncounterTeamsContextValue | null>(null);

export function useEncounterTeams() {
  const ctx = useContext(EncounterTeamsContext);
  if (!ctx) throw new Error('useEncounterTeams must be used within EncounterTeamsProvider');
  return ctx;
}

export function EncounterTeamsProvider({
  encounterId,
  children,
}: {
  encounterId: string;
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: loadingTeams } = useEncounterTeamsQuery(encounterId);

  const [searchPeople, setSearchPeople] = useState('');
  const debouncedPeopleSearch = useDebounce(searchPeople, 400);

  const {
    data: availablePages,
    isLoading: loadingPeople,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useEncounterAvailablePeople(
    encounterId,
    debouncedPeopleSearch ? { search: debouncedPeopleSearch } : undefined,
  );

  // Flatten paginated pages into a single array, deduplicating by ID
  // (page offsets can shift after add/remove, causing overlap between pages)
  const available: Person[] = (() => {
    if (!availablePages?.pages) return [];
    const seen = new Set<string>();
    const result: Person[] = [];
    for (const page of availablePages.pages) {
      for (const person of page.data) {
        if (!seen.has(person.id)) {
          seen.add(person.id);
          result.push(person);
        }
      }
    }
    return result;
  })();

  // Total from the last page meta (reflects server-side count)
  const totalAvailable = availablePages?.pages[availablePages.pages.length - 1]?.meta.total ?? 0;

  const [syncing, setSyncing] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState('');
  const [filterWorkedInTeam, setFilterWorkedInTeam] = useState(false);

  // Reset worked-in-team filter when selected team changes
  useEffect(() => { setFilterWorkedInTeam(false); }, [selectedTeamId]);

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: queryKeys.encounters.teams(encounterId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.encounters.availablePeople(encounterId) });
  }

  // — Actions —

  async function syncTeams() {
    setSyncing(true);
    try {
      await EncounterService.syncTeams(encounterId);
      invalidateAll();
      toast({ title: 'Equipes sincronizadas com o movimento.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'syncTeams()');
    } finally {
      setSyncing(false);
    }
  }

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
            toast({ title: `Esta equipe já tem ${team.coordinators_youth} coordenador(es) jovem. Adicione um casal.`, variant: 'error' });
            return;
          }
        } else if (person.type === 'couple') {
          const filled = activeCoords.filter((m) => m.person?.type === 'couple').length;
          if (filled >= team.coordinators_couples) {
            toast({ title: `Esta equipe já tem ${team.coordinators_couples} coordenador(es) casal. Adicione um jovem.`, variant: 'error' });
            return;
          }
        }
      }
    }

    try {
      await EncounterService.addMember(target, personId, role);
      invalidateAll();
      toast({ title: 'Pessoa adicionada.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'addMember()');
    }
  }

  async function removeMember(memberId: string, reason?: string) {
    try {
      await EncounterService.removeMember(memberId, reason);
      invalidateAll();
      toast({ title: 'Membro removido.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'removeMember()');
    }
  }

  async function updateMemberStatus(memberId: string, status: TeamMemberStatus, refusalReason?: string) {
    try {
      await EncounterService.updateMemberStatus(memberId, status, refusalReason);
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.teams(encounterId) });
    } catch (err: unknown) {
      handleError(err, 'updateMemberStatus()');
    }
  }

  // — Derived stats —
  const totalSlots     = teams.reduce((a, t) => a + t.max_members, 0);
  const totalFilled    = teams.reduce((a, t) => a + t.members_count, 0);
  const totalConfirmed = teams.reduce((a, t) => a + t.confirmed_count, 0);
  const teamsComplete  = teams.filter((t) => t.is_full).length;
  const selectedTeam   = teams.find((t) => t.id === selectedTeamId);

  // Client-side filters applied on top of server-side search
  const filteredAvailable = available.filter((p) => {
    if (filterType && p.type !== filterType) return false;
    if (filterWorkedInTeam && selectedTeam?.movement_team_id) {
      if (!p.past_movement_team_ids?.includes(selectedTeam.movement_team_id)) return false;
    }
    return true;
  });

  return (
    <EncounterTeamsContext.Provider value={{
      encounterId,
      teams, available, filteredAvailable, loadingTeams, loadingPeople,
      isFetchingNextPage, hasNextPage, totalAvailable,
      fetchNextPage, syncing,
      selectedTeamId, selectedTeam, searchPeople, filterType, filterWorkedInTeam,
      totalSlots, totalFilled, totalConfirmed, teamsComplete,
      setSelectedTeamId, setSearchPeople, setFilterType, setFilterWorkedInTeam,
      syncTeams, addMember, removeMember, updateMemberStatus,
    }}>
      {children}
    </EncounterTeamsContext.Provider>
  );
}
