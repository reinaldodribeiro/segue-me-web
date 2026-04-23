'use client';

import { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Sparkles, Loader2, AlertCircle, Users, Trophy, RefreshCw } from 'lucide-react';
import { Person } from '@/interfaces/Person';

import { useEncounterTeams } from '@/context/EncounterTeamsContext';
import { useEncounterAvailablePeople } from '@/lib/query/hooks/useEncounters';
import { useDebounce } from '@/hooks/useDebounce';
import EncounterService from '@/services/api/EncounterService';
import PersonRow from './PersonRow';
import EmptyState from './EmptyState';
import { AddMemberModalProps, AddMemberTab, AISuggestion } from './types';

/** In-memory cache keyed by `teamId:role` — persists across modal open/close for the session */
const aiCache = new Map<string, AISuggestion[]>();

const AddMemberModal: React.FC<AddMemberModalProps> = ({ open, onClose, team, role }) => {
  const { encounterId, teams, addMember } = useEncounterTeams();

  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<AddMemberTab>('available');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [filterType, setFilterType] = useState('');
  const [filterWorkedInTeam, setFilterWorkedInTeam] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pendingCloseCheck = useRef(false);

  // Modal has its own independent infinite query with server-side search
  const modalFilters = useMemo(
    () => (debouncedSearch ? { search: debouncedSearch } : undefined),
    [debouncedSearch],
  );
  const {
    data: modalPages,
    isFetchingNextPage: modalFetchingNext,
    hasNextPage: modalHasNext,
    fetchNextPage: modalFetchNext,
  } = useEncounterAvailablePeople(open ? encounterId : '', modalFilters);

  // Separate infinite query for priorities tab (server-side filter: priority=true)
  const priorityFilters = useMemo(
    () => ({ priority: true as const, ...(debouncedSearch ? { search: debouncedSearch } : {}) }),
    [debouncedSearch],
  );
  const {
    data: priorityPages,
    isFetchingNextPage: priorityFetchingNext,
    hasNextPage: priorityHasNext,
    fetchNextPage: priorityFetchNext,
  } = useEncounterAvailablePeople(open ? encounterId : '', priorityFilters);

  // Helper to flatten + deduplicate pages
  function flattenPages(pages: typeof modalPages): Person[] {
    if (!pages?.pages) return [];
    const seen = new Set<string>();
    const result: Person[] = [];
    for (const page of pages.pages) {
      for (const person of page.data) {
        if (!seen.has(person.id)) {
          seen.add(person.id);
          result.push(person);
        }
      }
    }
    return result;
  }

  const available: Person[] = useMemo(() => flattenPages(modalPages), [modalPages]);
  const priorityPeopleRaw: Person[] = useMemo(() => flattenPages(priorityPages), [priorityPages]);

  const totalAvailable = modalPages?.pages[modalPages.pages.length - 1]?.meta.total ?? 0;
  const totalPriority = priorityPages?.pages[priorityPages.pages.length - 1]?.meta.total ?? 0;

  // Determine active infinite scroll state based on current tab
  const activeHasNext = tab === 'priorities' ? priorityHasNext : modalHasNext;
  const activeFetchingNext = tab === 'priorities' ? priorityFetchingNext : modalFetchingNext;
  const activeFetchNext = tab === 'priorities' ? priorityFetchNext : modalFetchNext;

  // Infinite scroll observer for modal list
  // Depends on `rendered` (portal must be in DOM for refs) and `tab` (reconnect on tab switch)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!sentinel || !scrollContainer || !activeHasNext || !open || !rendered) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && activeHasNext && !activeFetchingNext) {
          activeFetchNext();
        }
      },
      { root: scrollContainer, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [activeHasNext, activeFetchingNext, activeFetchNext, open, rendered, tab]);

  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(false);

  // Mount/unmount with animation
  useEffect(() => {
    if (open) {
      setRendered(true);
      setSearch('');
      setTab('available');
      setFilterType('');
      setAiError(false);
      setFilterWorkedInTeam(false);
      // Restore from cache if already generated for this team+role
      const cached = aiCache.get(`${team.id}:${role}`);
      if (cached) {
        setAiSuggestions(cached);
        setAiGenerated(true);
      } else {
        setAiSuggestions([]);
        setAiGenerated(false);
      }
    } else {
      setVisible(false);
      const t = setTimeout(() => setRendered(false), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!rendered || !open) return;
    const raf = requestAnimationFrame(() => {
      setVisible(true);
      setTimeout(() => searchRef.current?.focus(), 50);
    });
    return () => cancelAnimationFrame(raf);
  }, [rendered, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  async function fetchAiSuggestions() {
    setAiGenerated(true);
    setLoadingAI(true);
    setAiError(false);
    setAiSuggestions([]);
    try {
      const res = await EncounterService.suggestMembers(team.id, role);
      aiCache.set(`${team.id}:${role}`, res.data.data);
      setAiSuggestions(res.data.data);
    } catch {
      setAiError(true);
    } finally {
      setLoadingAI(false);
    }
  }

  // Filter available people by type + worked in team (search is now server-side)
  const filtered = useMemo(() => {
    return available.filter((p) => {
      if (filterType && p.type !== filterType) return false;
      if (filterWorkedInTeam && team.movement_team_id) {
        if (!p.past_movement_team_ids?.includes(team.movement_team_id)) return false;
      }
      return true;
    });
  }, [available, filterType, filterWorkedInTeam, team.movement_team_id]);

  // Priority people from dedicated query, with client-side type filter
  const priorityPeople = useMemo(() => {
    return priorityPeopleRaw.filter((p) => {
      if (filterType && p.type !== filterType) return false;
      return true;
    });
  }, [priorityPeopleRaw, filterType]);

  // Map AI suggestions to Person objects (maintain AI order, filter by type)
  const aiPeople = useMemo(() => {
    return aiSuggestions
      .map((s) => {
        const person = available.find((p) => p.id === s.person_id);
        if (!person) return null;
        if (filterType && person.type !== filterType) return null;
        if (filterWorkedInTeam && team.movement_team_id && !person.past_movement_team_ids?.includes(team.movement_team_id)) return null;
        return { person, reason: s.reason };
      })
      .filter((x): x is { person: Person; reason: string } => x !== null);
  }, [aiSuggestions, available, filterType, filterWorkedInTeam, team.movement_team_id]);

  // Check close conditions whenever teams updates after an add
  useEffect(() => {
    if (!pendingCloseCheck.current || !open) return;
    pendingCloseCheck.current = false;

    const updated = teams.find((t) => t.id === team.id);
    if (!updated) return;

    if (updated.is_full) { onClose(); return; }

    if (role === 'coordinator') {
      const totalCoordSlots = (updated.coordinators_youth ?? 0) + (updated.coordinators_couples ?? 0);
      const activeCoords = (updated.members ?? []).filter(
        (m) => m.role === 'coordinator' && m.status !== 'refused',
      ).length;
      if (totalCoordSlots > 0 && activeCoords >= totalCoordSlots) onClose();
    }
  }, [teams]);

  async function handleAdd(person: Person) {
    setAddingId(person.id);
    pendingCloseCheck.current = true;
    await addMember(person.id, role, team.id);
    setAddingId(null);
  }

  if (!rendered) return null;

  const roleLabel = role === 'coordinator' ? 'Coordenador' : 'Integrante';

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-250
          ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md
          bg-panel border border-border rounded-2xl shadow-2xl flex flex-col max-h-[80vh]
          transition-all duration-250 ease-out
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
          <div>
            <h2 className="text-base font-bold text-text">Adicionar {roleLabel}</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {team.name} · {totalAvailable} pessoa{totalAvailable !== 1 ? 's' : ''} disponível{totalAvailable !== 1 ? 'is' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-text-muted hover:bg-hover hover:text-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-5 shrink-0">
          {([
            { key: 'available' as AddMemberTab, label: 'Disponíveis', icon: <Users size={13} />, tutorialId: undefined },
            { key: 'priorities' as AddMemberTab, label: 'Prioridades', icon: <Trophy size={13} />, tutorialId: undefined },
            { key: 'suggestions' as AddMemberTab, label: 'Sugestões IA', icon: <Sparkles size={13} />, tutorialId: 'teams-ai-suggest' },
          ]).map(({ key, label, icon, tutorialId }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              data-tutorial={tutorialId}
              className={`flex items-center gap-1.5 px-1 pb-3 mr-5 text-xs font-semibold border-b-2 transition-colors
                ${tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'}`}
            >
              {icon}{label}
              {key === 'priorities' && totalPriority > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  {totalPriority}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + filter */}
        <div className="px-4 pt-3 pb-2 shrink-0 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou skill..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input-border bg-input-bg text-input-text placeholder:text-text-muted/60 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {([
              { value: '',       label: 'Todos' },
              { value: 'youth',  label: 'Jovens' },
              { value: 'couple', label: 'Casais' },
            ] as { value: string; label: string }[]).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilterType(value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                  ${filterType === value
                    ? 'bg-primary text-white'
                    : 'bg-hover text-text-muted hover:text-text'}`}
              >
                {label}
              </button>
            ))}
          </div>
          {team.movement_team_id && (
            <button
              onClick={() => setFilterWorkedInTeam(!filterWorkedInTeam)}
              className={`w-full text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors text-left ${
                filterWorkedInTeam
                  ? 'bg-primary text-white border-primary'
                  : 'bg-panel text-text-muted border-border hover:border-primary hover:text-text'
              }`}
            >
              {filterWorkedInTeam ? '✓ ' : ''}Trabalhou nessa equipe
            </button>
          )}
        </div>

        {/* List */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-2 pb-3">
          {tab === 'available' ? (
            filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {filtered.map((p) => (
                  <PersonRow
                    key={p.id}
                    person={p}
                    onAdd={() => handleAdd(p)}
                    adding={addingId === p.id}
                  />
                ))}
                <div ref={tab === 'available' ? sentinelRef : undefined} className="h-4" />
                {modalFetchingNext && (
                  <div className="flex items-center justify-center py-3 gap-2 text-text-muted">
                    <RefreshCw size={12} className="animate-spin" />
                    <span className="text-xs">Carregando mais...</span>
                  </div>
                )}
              </>
            )
          ) : tab === 'priorities' ? (
            priorityPeople.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-text-muted">
                <Trophy size={28} className="text-text-muted/30" />
                <p className="text-sm text-center max-w-[220px]">
                  Nenhuma pessoa disponível vivenciou o encontro anteriormente.
                </p>
              </div>
            ) : (
              <>
                <div className="px-3 pb-1 pt-2">
                  <p className="text-[10px] text-text-muted">Ordenados por engajamento · já vivenciaram o encontro · {totalPriority} pessoa{totalPriority !== 1 ? 's' : ''}</p>
                </div>
                {priorityPeople.map((p) => (
                  <PersonRow
                    key={p.id}
                    person={p}
                    onAdd={() => handleAdd(p)}
                    adding={addingId === p.id}
                    encounterYear={p.encounter_year ?? undefined}
                  />
                ))}
                <div ref={tab === 'priorities' ? sentinelRef : undefined} className="h-4" />
                {priorityFetchingNext && (
                  <div className="flex items-center justify-center py-3 gap-2 text-text-muted">
                    <RefreshCw size={12} className="animate-spin" />
                    <span className="text-xs">Carregando mais...</span>
                  </div>
                )}
              </>
            )
          ) : (
            /* Sugestões IA */
            !aiGenerated ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <p className="text-sm text-center max-w-[220px]">
                  A IA analisa habilidades e histórico para sugerir as melhores pessoas para esta equipe.
                </p>
                <button
                  onClick={fetchAiSuggestions}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Sparkles size={12} />
                  Gerar Sugestão
                </button>
              </div>
            ) : loadingAI ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                <Loader2 size={24} className="animate-spin text-primary" />
                <p className="text-sm">Consultando IA…</p>
                <p className="text-xs text-center max-w-[200px]">Analisando habilidades, engajamento e histórico de equipes</p>
              </div>
            ) : aiError ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
                <AlertCircle size={24} className="text-red-400" />
                <p className="text-sm">Não foi possível carregar as sugestões</p>
                <button
                  onClick={fetchAiSuggestions}
                  className="text-xs text-primary hover:underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : aiPeople.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="px-3 pb-2 pt-1">
                  <p className="text-[10px] text-text-muted">Sugerido por IA</p>
                </div>
                {aiPeople.map(({ person, reason }) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    onAdd={() => handleAdd(person)}
                    adding={addingId === person.id}
                    aiReason={reason}
                  />
                ))}
              </>
            )
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}

export default AddMemberModal;
