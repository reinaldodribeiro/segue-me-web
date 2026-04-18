'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SectionCard from '@/components/SectionCard';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useToast } from '@/hooks/useToast';
import { MovementPayload, AcceptedType, MovementScope } from '@/interfaces/Movement';
import MovementService from '@/services/api/MovementService';
import { useTutorial } from '@/hooks/useTutorial';

const NewMovement: React.FC = () => {
  useTutorial();
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [targetAudience, setTargetAudience] = useState<AcceptedType>('youth');
  const [scope, setScope] = useState<MovementScope>('parish');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    const payload: MovementPayload = {
      name: name.trim(),
      target_audience: targetAudience,
      scope,
      description: description.trim() || null,
    };
    try {
      await MovementService.save(payload);
      toast({ title: 'Movimento criado com sucesso.', variant: 'success' });
      router.push('/app/movements');
    } catch (err: unknown) {
      handleError(err, 'handleSubmit()');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Novo Movimento</h1>
        <p className="text-sm text-text-muted mt-0.5">Configure o movimento pastoral</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <SectionCard title="Identificação" data-tutorial="new-movement-name">
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
          </div>
        </SectionCard>

        <SectionCard title="Descrição" data-tutorial="new-movement-scope">
          <textarea
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Descrição do movimento..."
            className="w-full rounded-lg border border-input-border bg-input-bg text-input-text text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
          />
        </SectionCard>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" loading={loading}>Criar Movimento</Button>
        </div>
      </form>
    </div>
  );
};

export default NewMovement;
