'use client';

import { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Sparkles, Loader2, AlertCircle, Users, Trophy } from 'lucide-react';
import { Person } from '@/interfaces/Person';
import { personDisplayName } from '@/utils/personDisplay';
import { useEncounterTeams } from '@/context/EncounterTeamsContext';
import EncounterService from '@/services/api/EncounterService';
import PersonRow from './PersonRow';
import EmptyState from './EmptyState';
import { AddMemberModalProps, AddMemberTab, AISuggestion } from './types';

/** In-memory cache keyed by `teamId:role` — persists across modal open/close for the session */
const aiCache = new Map<string, AISuggestion[]>();

const AddMemberModal: React.FC<AddMemberModalProps> = ({ open, onClose, team, role }) => {
  const { teams, available, addMember } = useEncounterTeams();

  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState<AddMemberTab>('available');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterWorkedInTeam, setFilterWorkedInTeam] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pendingCloseCheck = useRef(false);

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

  // Filter available people by search + type + worked in team
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return available.filter((p) => {
      if (filterType && p.type !== filterType) return false;
      if (filterWorkedInTeam && team.movement_team_id) {
        if (!p.past_movement_team_ids?.includes(team.movement_team_id)) return false;
      }
      return (
        personDisplayName(p).toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q))
      );
    });
  }, [available, search, filterType, filterWorkedInTeam, team.movement_team_id]);

  // Priority people: those who experienced an encounter (encounter_year set), sorted by engagement desc
  const priorityPeople = useMemo(() => {
    const q = search.toLowerCase();
    return available
      .filter((p) => {
        if (!p.encounter_year) return false;
        if (filterType && p.type !== filterType) return false;
        return (
          personDisplayName(p).toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.engagement_score - a.engagement_score);
  }, [available, search, filterType]);

  // Map AI suggestions to Person objects (maintain AI order, filter by search)
  const aiPeople = useMemo(() => {
    const q = search.toLowerCase();
    return aiSuggestions
      .map((s) => {
        const person = available.find((p) => p.id === s.person_id);
        if (!person) return null;
        if (filterType && person.type !== filterType) return null;
        if (filterWorkedInTeam && team.movement_team_id && !person.past_movement_team_ids?.includes(team.movement_team_id)) return null;
        if (q && !personDisplayName(person).toLowerCase().includes(q) && !person.skills.some((sk) => sk.toLowerCase().includes(q))) return null;
        return { person, reason: s.reason };
      })
      .filter((x): x is { person: Person; reason: string } => x !== null);
  }, [aiSuggestions, available, search, filterType, filterWorkedInTeam, team.movement_team_id]);

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
              {team.name} · {available.length} pessoa{available.length !== 1 ? 's' : ''} disponível{available.length !== 1 ? 'is' : ''}
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
            { key: 'available' as AddMemberTab, label: 'Disponíveis', icon: <Users size={13} /> },
            { key: 'priorities' as AddMemberTab, label: 'Prioridades', icon: <Trophy size={13} /> },
            { key: 'suggestions' as AddMemberTab, label: 'Sugestões IA', icon: <Sparkles size={13} /> },
          ]).map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-1 pb-3 mr-5 text-xs font-semibold border-b-2 transition-colors
                ${tab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'}`}
            >
              {icon}{label}
              {key === 'priorities' && priorityPeople.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                  {priorityPeople.length}
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
        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {tab === 'available' ? (
            filtered.length === 0 ? (
              <EmptyState />
            ) : (
              filtered.map((p) => (
                <PersonRow
                  key={p.id}
                  person={p}
                  onAdd={() => handleAdd(p)}
                  adding={addingId === p.id}
                />
              ))
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
                  <p className="text-[10px] text-text-muted">Ordenados por engajamento · já vivenciaram o encontro</p>
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
