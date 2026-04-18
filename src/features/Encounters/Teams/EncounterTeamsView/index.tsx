'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { RefreshCw, X, Trash2 } from 'lucide-react';
import { Person } from '@/interfaces/Person';
import { TeamMemberRole } from '@/interfaces/Encounter';
import { useEncounterTeams } from '@/context/EncounterTeamsContext';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import Button from '@/components/Button';
import EncounterService from '@/services/api/EncounterService';
import StatsBar from '../StatsBar';
import TeamMapGrid from '../TeamMapGrid';
import PeoplePanel from '../PeoplePanel';
import PersonGhost from '../PersonGhost';

const EncounterTeamsView: React.FC = () => {
  const {
    encounterId,
    teams, available,
    loadingTeams, syncing,
    totalSlots, totalFilled, totalConfirmed, teamsComplete,
    syncTeams, addMember,
  } = useEncounterTeams();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const [draggingPerson, setDraggingPerson] = useState<Person | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    try {
      await EncounterService.resetMembers(encounterId);
      setConfirmReset(false);
      await syncTeams();
      toast({ title: 'Todas as equipes foram limpas.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleReset()');
    } finally {
      setResetting(false);
    }
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(event: { active: { id: string | number } }) {
    const person = available.find((p) => p.id === event.active.id);
    if (person) setDraggingPerson(person);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingPerson(null);
    const { active, over } = event;
    if (!over) return;
    const overId = over.id as string;
    const sep = overId.lastIndexOf('--');
    if (sep === -1) return;
    const teamId = overId.slice(0, sep);
    const role = overId.slice(sep + 2) as TeamMemberRole;
    addMember(active.id as string, role, teamId);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-4 max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-end flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {confirmReset ? (
              <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5">
                <span className="text-xs text-red-700 font-medium">Limpar todas as equipes?</span>
                <button
                  onClick={handleReset}
                  disabled={resetting}
                  className="text-xs text-red-600 font-semibold hover:text-red-800 disabled:opacity-50 px-1"
                >
                  {resetting ? 'Limpando...' : 'Confirmar'}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  disabled={resetting}
                  className="text-xs text-text-muted hover:text-text"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="danger"
                leftIcon={<Trash2 size={13} />}
                onClick={() => setConfirmReset(true)}
                disabled={totalFilled === 0}
              >
                Resetar equipes
              </Button>
            )}
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />}
              loading={syncing}
              onClick={syncTeams}
            >
              Sincronizar templates
            </Button>
          </div>
        </div>

        {/* Stats */}
        {!loadingTeams && teams.length > 0 && (
          <StatsBar
            totalFilled={totalFilled}
            totalSlots={totalSlots}
            totalConfirmed={totalConfirmed}
            teamsComplete={teamsComplete}
            teamsLength={teams.length}
          />
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          <div className="lg:col-span-3 relative z-10">
            <TeamMapGrid />
          </div>
          <div>
            <PeoplePanel />
          </div>
        </div>

      </div>

      <DragOverlay dropAnimation={null}>
        {draggingPerson && <PersonGhost person={draggingPerson} />}
      </DragOverlay>
    </DndContext>
  );
};

export default EncounterTeamsView;
