"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, RefreshCw, X, Trophy } from "lucide-react";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Drawer from "@/components/Drawer";
import PersonProfileDrawer from "@/components/PersonProfileDrawer";
import {
  Person,
  PersonHistory,
  PersonTeamExperience,
} from "@/interfaces/Person";
import { TeamMemberRole } from "@/interfaces/Encounter";
import { useEncounterTeams } from "@/hooks/useEncounterTeams";
import { useEncounterPreviousParticipants } from "@/lib/query/hooks/useEncounters";
import PersonService from "@/services/api/PersonService";
import DraggablePerson from "./DraggablePerson";

// ——— Panel ———

const PeoplePanel: SafeFC = () => {
  const {
    encounterId,
    filteredAvailable,
    loadingPeople,
    isFetchingNextPage,
    hasNextPage,
    totalAvailable,
    fetchNextPage,
    selectedTeam,
    selectedTeamId,
    setSelectedTeamId,
    searchPeople,
    setSearchPeople,
    filterType,
    setFilterType,
    filterWorkedInTeam,
    setFilterWorkedInTeam,
    addMember,
  } = useEncounterTeams();

  const { data: previousParticipantIds = [] } = useEncounterPreviousParticipants(encounterId);

  const [addRole, setAddRole] = useState<TeamMemberRole>("member");
  const [filterPriority, setFilterPriority] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPerson, setDrawerPerson] = useState<Person | null>(null);
  const [loadingExps, setLoadingExps] = useState(false);
  const [experiences, setExperiences] = useState<PersonTeamExperience[]>([]);
  const [historyData, setHistoryData] = useState<PersonHistory[]>([]);
  const lastPersonRef = useRef<Person | null>(null);

  // Refs for IntersectionObserver-based infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  function openProfile(person: Person) {
    lastPersonRef.current = person;
    setDrawerPerson(person);
    setDrawerOpen(true);
  }

  function closeProfile() {
    setDrawerOpen(false);
    setTimeout(() => setDrawerPerson(null), 300);
  }

  useEffect(() => {
    if (!drawerOpen || !drawerPerson) return;
    async function load() {
      setLoadingExps(true);
      try {
        const res = await PersonService.search(drawerPerson!.id);
        const p = res.data.data;
        setExperiences(p.team_experiences ?? []);
        setHistoryData(p.history ?? []);
      } finally {
        setLoadingExps(false);
      }
    }
    load();
  }, [drawerOpen, drawerPerson?.id]);

  // IntersectionObserver: trigger fetchNextPage when sentinel becomes visible
  // Depends on displayPeople.length because sentinel only exists when list is non-empty
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!sentinel || !scrollContainer || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: scrollContainer, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, filteredAvailable.length]);

  const displayPeople = useMemo(() => {
    if (!filterPriority) return filteredAvailable;
    const hasPrevious = previousParticipantIds.length > 0;
    return filteredAvailable
      .filter((p) =>
        hasPrevious
          ? previousParticipantIds.includes(p.id)
          : p.encounter_year != null
      )
      .sort((a, b) => b.engagement_score - a.engagement_score);
  }, [filteredAvailable, filterPriority, previousParticipantIds]);

  const totalCoordSlots = selectedTeam
    ? selectedTeam.coordinators_youth + selectedTeam.coordinators_couples
    : 0;
  const totalMemberSlots = selectedTeam
    ? Math.max(0, selectedTeam.max_members - totalCoordSlots)
    : 0;

  useEffect(() => {
    if (!selectedTeam) return;
    if (addRole === "coordinator" && totalCoordSlots === 0)
      setAddRole("member");
    if (addRole === "member" && totalMemberSlots === 0)
      setAddRole("coordinator");
  }, [selectedTeam?.id]);

  const roles: { role: TeamMemberRole; label: string; enabled: boolean }[] = [
    {
      role: "member",
      label: "Integrante",
      enabled: !selectedTeam || totalMemberSlots > 0,
    },
    {
      role: "coordinator",
      label: "Coordenador",
      enabled: !selectedTeam || totalCoordSlots > 0,
    },
  ];

  return (
    <>
      <div className="bg-panel border border-border rounded-xl p-4 space-y-3 sticky top-4" data-tutorial="teams-people-panel">
        <h2 className="font-semibold text-sm text-text">Pessoas disponíveis</h2>

        {selectedTeam ? (
          <div className="flex items-center justify-between gap-2 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg text-xs font-medium">
            <span className="truncate">
              → <strong>{selectedTeam.name}</strong>
            </span>
            <button
              onClick={() => setSelectedTeamId(null)}
              className="shrink-0 hover:opacity-70"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <p className="text-xs text-text-muted bg-hover/60 px-2.5 py-1.5 rounded-lg text-center">
            Selecione uma equipe ou arraste
          </p>
        )}

        <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
          {roles.map(({ role: r, label, enabled }) => (
            <button
              key={r}
              onClick={() => enabled && setAddRole(r)}
              disabled={!enabled}
              className={`flex-1 py-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                addRole === r
                  ? "bg-primary text-white"
                  : "text-text-muted hover:bg-hover"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Input
          name="search"
          placeholder="Buscar..."
          value={searchPeople}
          onChange={(e) => setSearchPeople(e.target.value)}
          startIcon={<Search size={14} />}
        />

        <Select
          name="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos os tipos</option>
          <option value="youth">Jovens</option>
          <option value="couple">Casais</option>
        </Select>

        {selectedTeam?.movement_team_id && (
          <button
            onClick={() => setFilterWorkedInTeam(!filterWorkedInTeam)}
            className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors text-left ${
              filterWorkedInTeam
                ? "bg-primary text-white border-primary"
                : "bg-panel text-text-muted border-border hover:border-primary hover:text-text"
            }`}
          >
            {filterWorkedInTeam ? "✓ " : ""}Trabalhou nessa equipe
          </button>
        )}
        <button
          onClick={() => setFilterPriority(!filterPriority)}
          className={`w-full flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors text-left ${
            filterPriority
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-panel text-text-muted border-border hover:border-amber-400 hover:text-text"
          }`}
        >
          <Trophy size={11} />
          {filterPriority ? "✓ " : ""}Prioridade (vivenciaram o último encontro)
        </button>

        {/* Total count */}
        {!loadingPeople && totalAvailable > 0 && (
          <p className="text-xs text-text-muted text-center font-medium">
            {filteredAvailable.length} de {totalAvailable} pessoas disponíveis
          </p>
        )}

        <div ref={scrollContainerRef} className="space-y-0.5 max-h-[55vh] overflow-y-auto">
          {loadingPeople ? (
            <div className="flex items-center justify-center py-6 gap-2 text-text-muted">
              <RefreshCw size={14} className="animate-spin" />
              <span className="text-xs">Carregando...</span>
            </div>
          ) : displayPeople.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">
              {filterPriority
                ? "Nenhuma pessoa com prioridade disponível."
                : "Nenhuma pessoa disponível."}
            </p>
          ) : (
            <>
              {displayPeople.map((p) => (
                <DraggablePerson
                  key={p.id}
                  person={p}
                  selected={!!selectedTeamId}
                  onAdd={() => addMember(p.id, addRole)}
                  onInfo={() => openProfile(p)}
                />
              ))}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {/* Loading indicator for next page */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-3 gap-2 text-text-muted">
                  <RefreshCw size={12} className="animate-spin" />
                  <span className="text-xs">Carregando mais...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Drawer open={drawerOpen} onClose={closeProfile} title="Perfil">
        {drawerPerson && (
          <PersonProfileDrawer
            person={drawerPerson}
            experiences={experiences}
            historyData={historyData}
            loadingExps={loadingExps}
            onClose={closeProfile}
          />
        )}
      </Drawer>
    </>
  );
};

export default PeoplePanel;
