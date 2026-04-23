'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Button from '@/components/Button';
import Input from '@/components/Input';
import DateInput from '@/components/DateInput';
import Select from '@/components/Select';
import SectionCard from '@/components/SectionCard';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { EncounterPayload } from '@/interfaces/Encounter';
import { Movement } from '@/interfaces/Movement';
import EncounterService from '@/services/api/EncounterService';
import MovementService from '@/services/api/MovementService';
import { queryKeys } from '@/lib/query/keys';
import { useTutorial } from '@/hooks/useTutorial';

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function buildDatesSummary(startIso: string, days: number): string {
  const [y, m, d] = startIso.split('-').map(Number);
  const month = MONTH_NAMES[m - 1];
  if (days === 1) return `${d} de ${month} de ${y}`;
  const endDate = new Date(y, m - 1, d + days - 1);
  const endDay = endDate.getDate();
  const endMonth = MONTH_NAMES[endDate.getMonth()];
  const endYear = endDate.getFullYear();
  if (endMonth === month) {
    const dayList = Array.from({ length: days }, (_, i) => d + i).join(', ');
    return `Dias ${dayList} de ${month} de ${y}`;
  }
  return `${d} de ${month} a ${endDay} de ${endMonth} de ${endYear}`;
}

const NewEncounter: React.FC = () => {
  useTutorial();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementId, setMovementId] = useState('');
  const [name, setName] = useState('');
  const [editionNumber, setEditionNumber] = useState('');
  const [date, setDate] = useState('');
  const [durationDays, setDurationDays] = useState('3');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    MovementService.list({ per_page: 200 })
      .then((res) => setMovements(res.data.data))
      .catch(() => toast({ title: 'Erro ao carregar movimentos.', variant: 'error' }));
  }, []);

  const datesSummary = useMemo(() => {
    const days = parseInt(durationDays, 10);
    if (!date || !days || days < 1) return null;
    return buildDatesSummary(date, days);
  }, [date, durationDays]);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!movementId) { toast({ title: 'Selecione um movimento.', variant: 'error' }); return; }
    if (!date) { toast({ title: 'Informe a data de início do encontro.', variant: 'error' }); return; }

    setLoading(true);
    const payload: EncounterPayload = {
      movement_id: movementId,
      name: name.trim(),
      edition_number: editionNumber ? Number(editionNumber) : null,
      date,
      duration_days: parseInt(durationDays, 10) || 1,
      location: location.trim() || null,
      max_participants: maxParticipants ? Number(maxParticipants) : null,
    };
    try {
      const res = await EncounterService.save(payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.all });
      toast({ title: 'Encontro criado com sucesso.', variant: 'success' });
      router.push(`/app/encounters/${res.data.data.id}`);
    } catch (err: unknown) {
      handleError(err, 'handleSubmit()');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Novo Encontro</h1>
        <p className="text-sm text-text-muted mt-0.5">Configure o encontro pastoral</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionCard title="Identificação" data-tutorial="new-encounter-movement">
          <div className="space-y-4">
            <Select name="movement_id" label="Movimento" value={movementId} onChange={(e) => setMovementId(e.target.value)} required>
              <option value="">Selecione um movimento...</option>
              {movements.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
            <div data-tutorial="new-encounter-name" className="space-y-4">
              <Input name="name" label="Nome do encontro" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input name="edition_number" label="Edição (opcional)" type="number" min={1} value={editionNumber} onChange={(e) => setEditionNumber(e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Logística" data-tutorial="new-encounter-date">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <DateInput name="date" label="Data de início" value={date} onChange={(e) => setDate(e.target.value)} required />
              <Input
                name="duration_days"
                label="Duração (dias)"
                type="number"
                min={1}
                max={30}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                required
              />
            </div>
            {datesSummary && (
              <p className="text-xs text-primary bg-primary/8 px-3 py-2 rounded-lg font-medium">
                📅 {datesSummary}
              </p>
            )}
            <div data-tutorial="new-encounter-location" className="space-y-4">
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
          </div>
        </SectionCard>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={loading}>Criar Encontro</Button>
        </div>
      </form>
    </div>
  );
};

export default NewEncounter;
