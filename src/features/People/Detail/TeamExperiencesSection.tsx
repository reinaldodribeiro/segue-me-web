'use client';

import React, { useEffect, useState } from 'react';
import { Crown, Loader2, Plus, Users, X } from 'lucide-react';
import Button from '@/components/Button';
import SectionCard from '@/components/SectionCard';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  PersonTeamExperience,
  TeamExperienceRole,
} from '@/interfaces/Person';
import { Movement, MovementTeam } from '@/interfaces/Movement';
import PersonService from '@/services/api/PersonService';
import MovementService from '@/services/api/MovementService';
import { resolveTeamIcon } from '@/components/TeamIconPicker';
import { cn } from '@/utils/helpers';

interface TeamExperiencesSectionProps {
  personId: string;
  initialExperiences: PersonTeamExperience[];
  canEdit: boolean;
}

const TeamExperiencesSection: React.FC<TeamExperiencesSectionProps> = React.memo(
  ({ personId, initialExperiences, canEdit }) => {
    const { toast } = useToast();
    const { handleError } = useErrorHandler();

    const [experiences, setExperiences] = useState<PersonTeamExperience[]>(initialExperiences);
    const [showExpForm, setShowExpForm] = useState(false);
    const [expMovements, setExpMovements] = useState<Movement[]>([]);
    const [expTeams, setExpTeams] = useState<MovementTeam[]>([]);
    const [expMovementId, setExpMovementId] = useState('');
    const [expTeamId, setExpTeamId] = useState('');
    const [expTeamName, setExpTeamName] = useState('');
    const [expRole, setExpRole] = useState<TeamExperienceRole>('member');
    const [expYear, setExpYear] = useState('');
    const [savingExp, setSavingExp] = useState(false);
    const [loadingTeams, setLoadingTeams] = useState(false);

    // Sync if parent reloads person data
    useEffect(() => {
      setExperiences(initialExperiences);
    }, [initialExperiences]);

    useEffect(() => {
      if (!showExpForm) return;
      async function load() {
        try {
          const res = await MovementService.list({ per_page: 100 });
          setExpMovements(res.data.data ?? []);
        } catch (err: unknown) {
          handleError(err, 'loadMovements()');
        }
      }
      load();
    }, [showExpForm]);

    useEffect(() => {
      if (!expMovementId) { setExpTeams([]); setExpTeamId(''); setExpTeamName(''); return; }
      async function load() {
        setLoadingTeams(true);
        try {
          const res = await MovementService.getTeams(expMovementId);
          setExpTeams(res.data.data);
          setExpTeamId('');
          setExpTeamName('');
        } catch (err: unknown) {
          handleError(err, 'loadTeams()');
        } finally {
          setLoadingTeams(false);
        }
      }
      load();
    }, [expMovementId]);

    function resetExpForm() {
      setExpMovementId(''); setExpTeamId(''); setExpTeamName('');
      setExpRole('member'); setExpYear(''); setExpTeams([]); setShowExpForm(false);
    }

    async function handleSaveExperience() {
      if (!expTeamName.trim() && !expTeamId) {
        toast({ title: 'Selecione ou informe uma equipe.', variant: 'error' });
        return;
      }
      setSavingExp(true);
      try {
        const res = await PersonService.addTeamExperience(personId, {
          movement_team_id: expTeamId || null,
          team_name: expTeamName.trim(),
          role: expRole,
          year: expYear ? parseInt(expYear, 10) : null,
        });
        setExperiences((prev) => [res.data.data, ...prev]);
        toast({ title: 'Experiência adicionada.', variant: 'success' });
        resetExpForm();
      } catch (err: unknown) {
        handleError(err, 'handleSaveExperience()');
      } finally {
        setSavingExp(false);
      }
    }

    async function handleDeleteExperience(experienceId: string) {
      try {
        await PersonService.deleteTeamExperience(personId, experienceId);
        setExperiences((prev) => prev.filter((e) => e.id !== experienceId));
        toast({ title: 'Experiência removida.', variant: 'success' });
      } catch (err: unknown) {
        handleError(err, 'handleDeleteExperience()');
      }
    }

    return (
      <SectionCard title="Equipes Anteriores" action={<Users size={15} className="text-text-muted" />}>
        <div className="space-y-3">
          {experiences.length > 0 ? (
            <div className="space-y-2">
              {experiences.map((exp) => (
                <div key={exp.id} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => {
                      const TeamIcon = resolveTeamIcon(exp.team_icon);
                      if (TeamIcon) return <TeamIcon size={14} className="shrink-0 text-primary" />;
                      return exp.role === 'coordinator'
                        ? <Crown size={14} className="shrink-0 text-primary" />
                        : <Users size={14} className="shrink-0 text-text-muted" />;
                    })()}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{exp.team_name}</p>
                      <p className="text-xs text-text-muted">
                        {exp.role_label}{exp.year ? ` · ${exp.year}` : ''}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="shrink-0 text-text-muted hover:text-red-500 transition-colors"
                      title="Remover"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">Nenhuma experiência registrada.</p>
          )}

          {canEdit && !showExpForm && (
            <button
              type="button"
              onClick={() => setShowExpForm(true)}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors mt-1"
            >
              <Plus size={14} /> Adicionar
            </button>
          )}

          {canEdit && showExpForm && (
            <div className="border border-border rounded-xl p-4 space-y-3 bg-panel mt-2">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Movimento</label>
                <select
                  value={expMovementId}
                  onChange={(e) => setExpMovementId(e.target.value)}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                >
                  <option value="">Selecionar movimento (opcional)</option>
                  {expMovements.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              {expMovementId ? (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Equipe</label>
                  {loadingTeams ? (
                    <div className="flex items-center gap-2 text-sm text-text-muted py-2">
                      <Loader2 size={13} className="animate-spin" /> Carregando equipes...
                    </div>
                  ) : (
                    <select
                      value={expTeamId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const selectedTeam = expTeams.find((t) => t.id === selectedId);
                        setExpTeamId(selectedId);
                        setExpTeamName(selectedTeam?.name ?? '');
                      }}
                      className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    >
                      <option value="">Selecionar equipe</option>
                      {expTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">Nome da equipe</label>
                  <input
                    type="text"
                    value={expTeamName}
                    onChange={(e) => setExpTeamName(e.target.value)}
                    placeholder="Ex: Equipe de Liturgia"
                    className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Ano (opcional)</label>
                <input
                  type="number"
                  value={expYear}
                  onChange={(e) => setExpYear(e.target.value)}
                  placeholder={String(new Date().getFullYear())}
                  min={1900}
                  max={new Date().getFullYear() + 1}
                  className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-muted mb-1">Função</label>
                <div className="flex gap-2">
                  {(['member', 'coordinator'] as TeamExperienceRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setExpRole(r)}
                      className={cn(
                        'flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors',
                        expRole === r
                          ? 'bg-primary text-white border-primary'
                          : 'bg-hover text-text-muted border-border hover:border-primary/40',
                      )}
                    >
                      {r === 'coordinator' ? 'Coordenador' : 'Integrante'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" variant="secondary" type="button" onClick={resetExpForm}>Cancelar</Button>
                <Button size="sm" type="button" loading={savingExp} onClick={handleSaveExperience}>Salvar</Button>
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    );
  },
);

TeamExperiencesSection.displayName = 'TeamExperiencesSection';

export default TeamExperiencesSection;
