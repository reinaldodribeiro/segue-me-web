'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SectionCard from '@/components/SectionCard';
import Toggle from '@/components/Toggle';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { AcceptedType, MovementTeam, MovementTeamPayload, MovementScope } from '@/interfaces/Movement';
import MovementService from '@/services/api/MovementService';
import { useMovement, useMovementTeams } from '@/lib/query/hooks/useMovements';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import TeamForm from './TeamForm';
import SortableTeamRow from './SortableTeamRow';

import { MovementDetailProps } from './types';
import { useTutorial } from '@/hooks/useTutorial';

const MovementDetail: React.FC<MovementDetailProps> = ({ id }) => {
  useTutorial();
  const router = useRouter();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  const { data: movement, isLoading: loading } = useMovement(id);
  const { data: teamsData } = useMovementTeams(id);

  const [teams, setTeams] = useState<MovementTeam[]>([]);
  const [saving, setSaving] = useState(false);
  const [addingTeam, setAddingTeam] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState<AcceptedType>('youth');
  const [scope, setScope] = useState<MovementScope>('parish');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const initializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!movement || initializedRef.current === id) return;
    initializedRef.current = id;
    setName(movement.name);
    setTargetAudience(movement.target_audience);
    setScope(movement.scope);
    setDescription(movement.description ?? '');
    setActive(movement.active);
  }, [movement, id]);

  useEffect(() => {
    if (teamsData) setTeams(teamsData);
  }, [teamsData]);

  async function handleSave(e: React.SyntheticEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await MovementService.put(id, { name, target_audience: targetAudience, scope, description: description || null, active });
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.detail(id) });
      toast({ title: 'Movimento atualizado.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleSave()');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddTeam(data: MovementTeamPayload) {
    setSavingTeam(true);
    try {
      const res = await MovementService.createTeam(id, data);
      setTeams((t) => [...t, res.data.data]);
      setAddingTeam(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.teams(id) });
      toast({ title: 'Equipe adicionada.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleAddTeam()');
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleUpdateTeam(teamId: string, data: MovementTeamPayload) {
    setSavingTeam(true);
    try {
      const res = await MovementService.updateTeam(id, teamId, data);
      setTeams((t) => t.map((x) => x.id === teamId ? res.data.data : x));
      setEditingTeamId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.teams(id) });
      toast({ title: 'Equipe atualizada.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleUpdateTeam()');
    } finally {
      setSavingTeam(false);
    }
  }

  async function handleDeleteTeam(teamId: string) {
    try {
      await MovementService.deleteTeam(id, teamId);
      setTeams((t) => t.filter((x) => x.id !== teamId));
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.teams(id) });
      toast({ title: 'Equipe removida.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleDeleteTeam()');
    }
  }

  async function handleReorder(teamId: string, direction: 'up' | 'down') {
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= teams.length) return;
    const reordered = arrayMove(teams, idx, swapIdx);
    setTeams(reordered);
    try {
      await MovementService.reorderTeams(id, reordered.map((t) => t.id));
    } catch (err: unknown) {
      handleError(err, 'handleReorder()');
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = teams.findIndex((t) => t.id === active.id);
    const newIndex = teams.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(teams, oldIndex, newIndex);
    setTeams(reordered);

    try {
      await MovementService.reorderTeams(id, reordered.map((t) => t.id));
    } catch (err: unknown) {
      handleError(err, 'handleDragEnd()');
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await MovementService.delete(id);
      toast({ title: 'Movimento removido.', variant: 'success' });
      router.push('/app/movements');
    } catch (err: unknown) {
      handleError(err, 'handleDelete()');
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (loading) return <div className="p-6 text-center py-20 text-text-muted text-sm">Carregando...</div>;
  if (!movement) return null;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-text">{movement.name}</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <SectionCard title="Informações" data-tutorial="movement-detail-info">
          <div className="space-y-4">
            <Input name="name" label="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
            <Select name="target_audience" label="Público-alvo" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as AcceptedType)}>
              <option value="youth">Jovens</option>
              <option value="couple">Casais</option>
              <option value="all">Todos</option>
            </Select>
            <Select name="scope" label="Âmbito" value={scope} onChange={(e) => setScope(e.target.value as MovementScope)}>
              <option value="parish">Paroquial</option>
              <option value="sector">Setorial</option>
              <option value="diocese">Diocesano</option>
            </Select>
            <div>
              <label className="text-sm font-medium text-text block mb-1">Descrição</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Toggle checked={active} onChange={() => setActive((v) => !v)} />
              <span className="text-sm font-medium text-text">Movimento ativo</span>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3">
          <Button type="submit" loading={saving}>Salvar</Button>
        </div>
      </form>

      {/* Team templates */}
      <SectionCard
        title="Equipes-modelo"
        data-tutorial="movement-detail-teams"
        action={
          <div data-tutorial="movement-detail-add-team">
            <Button size="sm" variant="ghost" leftIcon={<Plus size={13} />} onClick={() => setAddingTeam(true)}>
              Adicionar
            </Button>
          </div>
        }
      >
        <div className="space-y-1">
          {addingTeam && (
            <TeamForm onSave={handleAddTeam} onCancel={() => setAddingTeam(false)} saving={savingTeam} />
          )}
          {teams.length === 0 && !addingTeam && (
            <p className="text-sm text-text-muted py-2">Nenhuma equipe-modelo cadastrada.</p>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={teams.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              {teams.map((team) => (
                editingTeamId === team.id ? (
                  <TeamForm
                    key={team.id}
                    initial={team}
                    onSave={(d) => handleUpdateTeam(team.id, d)}
                    onCancel={() => setEditingTeamId(null)}
                    saving={savingTeam}
                  />
                ) : (
                  <SortableTeamRow
                    key={team.id}
                    team={team}
                    onEdit={() => setEditingTeamId(team.id)}
                    onDelete={() => handleDeleteTeam(team.id)}
                    onMoveUp={() => handleReorder(team.id, 'up')}
                    onMoveDown={() => handleReorder(team.id, 'down')}
                    isFirst={teams.indexOf(team) === 0}
                    isLast={teams.indexOf(team) === teams.length - 1}
                  />
                )
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </SectionCard>

      {/* Delete movement */}
      <SectionCard title="Remover Movimento">
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
            Remover Movimento
          </Button>
        )}
      </SectionCard>
    </div>
  );
};

export default MovementDetail;
