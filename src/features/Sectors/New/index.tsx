'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Map } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import SectorService from '@/services/api/SectorService';
import { queryKeys } from '@/lib/query/keys';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useHierarchyCascade } from '@/hooks/useHierarchyCascade';
import Select from '@/components/Select';

interface FormState {
  dioceseId: string;
  name: string;
  active: boolean;
}

interface FormErrors {
  dioceseId?: string;
  name?: string;
}

const NewSector: SafeFC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const [form, setForm] = useState<FormState>({
    dioceseId: searchParams.get('diocese') ?? user?.diocese_id ?? '',
    name: '',
    active: true,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { dioceses, loadingDioceses } = useHierarchyCascade({
    dioceseId: form.dioceseId,
    sectorId: '',
    loadSectors: false,
    loadParishes: false,
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.dioceseId) next.dioceseId = 'Selecione uma diocese';
    if (!form.name.trim()) next.name = 'Nome é obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await SectorService.create(form.dioceseId, {
        name: form.name.trim(),
        active: form.active,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      router.push(`/app/sectors/${res.data.data.id}`);
    } catch (err: unknown) {
      setSubmitError(
        (err as { data?: { message?: string } })?.data?.message ?? 'Erro ao criar setor. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  const backHref = form.dioceseId ? `/app/dioceses/${form.dioceseId}` : '/app/sectors';

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Novo Setor</h1>
          <p className="text-sm text-text-muted mt-0.5">Preencha os dados do setor</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-panel border border-border rounded-xl p-6 space-y-5">
          {isSuperAdmin && (
            <Select
              label="Diocese *" name="dioceseId" value={form.dioceseId}
              onChange={(e) => set('dioceseId', e.target.value)}
              disabled={loadingDioceses} error={errors.dioceseId}
            >
              <option value="">{loadingDioceses ? 'Carregando...' : 'Selecione a diocese'}</option>
              {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          )}

          <Input
            label="Nome *" name="name" placeholder="Ex: Setor Norte"
            value={form.name} onChange={(e) => set('name', e.target.value)}
            error={errors.name} startIcon={<Map size={16} />}
          />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Setor ativo</p>
              <p className="text-xs text-text-muted mt-0.5">Setores inativos não aparecem para seleção</p>
            </div>
            <Toggle checked={form.active} onChange={() => set('active', !form.active)} />
          </div>

          {submitError && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {submitError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <Link href={backHref}>
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>Criar Setor</Button>
        </div>
      </form>
    </div>
  );
};

export default NewSector;
