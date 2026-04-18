'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Trash2, FileText, CheckCircle2, ArrowRight, ClipboardList, Brain, UserCheck } from 'lucide-react';
import Encontristas from '../Encontristas';
import EvaluationProgress from './EvaluationProgress';
import AnalysisView from './AnalysisView';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DateInput from '@/components/DateInput';
import SectionCard from '@/components/SectionCard';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { usePermissions } from '@/hooks/usePermissions';
import { EncounterStatus, ENCOUNTER_STATUS_LABELS } from '@/interfaces/Encounter';
import EncounterService from '@/services/api/EncounterService';
import { useEncounter, useEncounterSummary } from '@/lib/query/hooks/useEncounters';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { slugify } from '@/utils/helpers';
import { useTutorial } from '@/hooks/useTutorial';

const STATUS_COLORS: Record<EncounterStatus, string> = {
  draft: 'text-text-muted bg-hover border-border',
  confirmed: 'text-blue-600 bg-blue-50 border-blue-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
};

function apiDateToInput(date: string | null): string {
  if (!date) return '';
  const [d, m, y] = date.split('/');
  return `${y}-${m}-${d}`;
}

import { EncounterDetailProps } from './types';

const EncounterDetail: React.FC<EncounterDetailProps> = ({ id }) => {
  useTutorial();
  const router = useRouter();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { isParishAdmin, isSuperAdmin, isCoordinator } = usePermissions();

  const queryClient = useQueryClient();
  const { data: encounter, isLoading: loading } = useEncounter(id);
  const { data: summary } = useEncounterSummary(id);

  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [editionNumber, setEditionNumber] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');

  const initializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!encounter || initializedRef.current === id) return;
    initializedRef.current = id;
    setName(encounter.name);
    setDate(apiDateToInput(encounter.date));
    setLocation(encounter.location ?? '');
    setEditionNumber(encounter.edition_number ? String(encounter.edition_number) : '');
    setMaxParticipants(encounter.max_participants ? String(encounter.max_participants) : '');
  }, [encounter, id]);

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await EncounterService.put(id, {
        name, date, location: location || null,
        edition_number: editionNumber ? Number(editionNumber) : null,
        max_participants: maxParticipants ? Number(maxParticipants) : null,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.detail(id) });
      toast({ title: 'Encontro atualizado.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleSave()');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(newStatus: EncounterStatus) {
    try {
      await EncounterService.put(id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.detail(id) });
      toast({ title: `Status alterado para "${ENCOUNTER_STATUS_LABELS[newStatus]}".`, variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleStatusChange()');
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await EncounterService.delete(id);
      toast({ title: 'Encontro removido.', variant: 'success' });
      router.push('/app/encounters');
    } catch (err: unknown) {
      handleError(err, 'handleDelete()');
      setDeleting(false);
    }
  }

  if (loading) return <div className="p-6 text-center py-20 text-text-muted text-sm">Carregando...</div>;
  if (!encounter) return null;

  const canEdit = isSuperAdmin || isParishAdmin || isCoordinator;
  const isCompleted = encounter.status === 'completed';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4" data-tutorial="encounter-detail-header">
        <div>
          <h1 className="text-xl font-bold text-text">{encounter.name}</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {encounter.movement?.name}
            {encounter.edition_number ? ` · ${encounter.edition_number}ª edição` : ''}
            {encounter.date ? ` · ${encounter.date}` : ''}
          </p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-semibold shrink-0 ${STATUS_COLORS[encounter.status]}`}>
          {ENCOUNTER_STATUS_LABELS[encounter.status]}
        </span>
      </div>

      {/* Status transitions */}
      {canEdit && !isCompleted && (() => {
        const noTeams = !summary || summary.teams.length === 0;
        const incompleteTeams = summary?.teams.filter((t) => t.is_below_minimum) ?? [];
        const blocked = noTeams || incompleteTeams.length > 0;
        return (
          <div className="bg-panel border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Avançar status:</span>
              {encounter.status === 'draft' && (
                <Button
                  size="sm"
                  leftIcon={<CheckCircle2 size={13} />}
                  disabled={blocked}
                  onClick={() => handleStatusChange('confirmed')}
                >
                  Confirmar encontro
                </Button>
              )}
              {encounter.status === 'confirmed' && (
                <Button
                  size="sm"
                  leftIcon={<CheckCircle2 size={13} />}
                  disabled={blocked}
                  onClick={() => handleStatusChange('completed')}
                >
                  Marcar como concluído
                </Button>
              )}
            </div>
            {noTeams && (
              <p className="text-xs text-amber-600 flex items-center gap-1.5">
                <Users size={12} />
                Configure as equipes do encontro antes de avançar o status.
              </p>
            )}
            {!noTeams && incompleteTeams.length > 0 && (
              <div className="text-xs text-amber-600 space-y-0.5">
                <p className="flex items-center gap-1.5 font-medium">
                  <Users size={12} />
                  {incompleteTeams.length === 1 ? 'Esta equipe está' : 'Estas equipes estão'} abaixo do mínimo de integrantes:
                </p>
                <ul className="pl-5 space-y-0.5">
                  {incompleteTeams.map((t) => (
                    <li key={t.id}>• {t.name} ({t.confirmed}/{t.min_members} confirmados)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })()}

      {/* Summary */}
      {summary && (
        <SectionCard title="Resumo das Equipes" data-tutorial="encounter-detail-teams-link">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Vagas total', value: summary.total_slots },
              { label: 'Preenchidas', value: summary.total_filled },
              { label: 'Confirmados', value: summary.total_confirmed, color: 'text-green-600' },
              { label: 'Pendentes', value: summary.total_pending, color: 'text-amber-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-bold ${color ?? 'text-text'}`}>{value}</p>
                <p className="text-xs text-text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            {summary.teams.map((t) => (
              <div key={t.id} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-text w-40 truncate">{t.name}</span>
                <div className="flex-1 bg-hover rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${t.is_full ? 'bg-green-500' : t.is_below_minimum ? 'bg-red-400' : 'bg-primary'}`}
                    style={{ width: `${Math.min(100, (t.total / t.max_members) * 100)}%` }}
                  />
                </div>
                <span className="text-text-muted w-16 text-right">{t.confirmed}/{t.max_members}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link href={`/app/encounters/${id}/teams`}>
              <Button variant="secondary" size="sm" leftIcon={<Users size={13} />} rightIcon={<ArrowRight size={13} />}>
                Gerenciar equipes
              </Button>
            </Link>
          </div>
        </SectionCard>
      )}

      {/* Encontristas */}
      <SectionCard title="Encontristas" action={<UserCheck size={15} className="text-text-muted" />} data-tutorial="encounter-detail-encontristas">
        <Encontristas
          encounterId={id}
          encounterName={encounter.name}
          maxParticipants={encounter.max_participants}
          isCompleted={isCompleted}
        />
      </SectionCard>

      {/* Edit info */}
      {canEdit && !isCompleted && (
        <form onSubmit={handleSave}>
          <SectionCard title="Informações">
            <div className="space-y-4">
              <Input name="name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input name="edition_number" label="Edição" type="number" min={1} value={editionNumber} onChange={(e) => setEditionNumber(e.target.value)} />
              <DateInput name="date" label="Data" value={date} onChange={(e) => setDate(e.target.value)} required />
              <Input name="location" label="Local" value={location} onChange={(e) => setLocation(e.target.value)} />
              <Input
                name="max_participants"
                label="Vagas máximas para encontristas (opcional)"
                type="number"
                min={1}
                max={9999}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" loading={saving}>Salvar</Button>
            </div>
          </SectionCard>
        </form>
      )}

      {/* Evaluation Progress */}
      {isCompleted && (
        <SectionCard title="Avaliação das Equipes" action={<ClipboardList size={15} className="text-text-muted" />}>
          <EvaluationProgress encounterId={id} isCompleted={isCompleted} />
        </SectionCard>
      )}

      {/* AI Analysis */}
      {isCompleted && (
        <SectionCard title="Análise do Encontro" action={<Brain size={15} className="text-text-muted" />} data-tutorial="encounter-detail-ai-analysis">
          <AnalysisView encounterId={id} encounterName={encounter.name} />
        </SectionCard>
      )}

      {/* Reports */}
      <SectionCard title="Relatórios" action={<FileText size={15} className="text-text-muted" />} data-tutorial="encounter-detail-pdf">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => EncounterService.downloadPdf(id, `encontro-${slugify(encounter.name)}.pdf`)}
          >
            Relatório PDF
          </Button>
        </div>
      </SectionCard>

      {/* Delete */}
      {(isSuperAdmin || isParishAdmin) && !isCompleted && (
        <SectionCard title="Remover Encontro">
          {confirmDelete ? (
            <div className="space-y-3">
              <p className="text-sm text-red-700">Tem certeza? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                <Button size="sm" variant="danger" loading={deleting} onClick={handleDelete}>Confirmar</Button>
              </div>
            </div>
          ) : (
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setConfirmDelete(true)}>
              Remover Encontro
            </Button>
          )}
        </SectionCard>
      )}
    </div>
  );
};

export default EncounterDetail;
