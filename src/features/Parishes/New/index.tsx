'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import ColorPicker from '@/components/ColorPicker';
import { ParishPayload } from '@/interfaces/Parish';
import ParishService from '@/services/api/ParishService';
import SectorService from '@/services/api/SectorService';
import { queryKeys } from '@/lib/query/keys';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useHierarchyCascade } from '@/hooks/useHierarchyCascade';
import Select from '@/components/Select';

interface FormState {
  dioceseId: string;
  sectorId: string;
  name: string;
  primary_color: string;
  secondary_color: string;
}

interface FormErrors {
  dioceseId?: string;
  sectorId?: string;
  name?: string;
}

const NewParish: SafeFC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isSuperAdmin } = usePermissions();

  const pendingSectorRef = useRef<string | null>(null);

  const [form, setForm] = useState<FormState>({
    dioceseId: searchParams.get('diocese') ?? user?.diocese_id ?? '',
    sectorId: '',
    name: '',
    primary_color: '#4f46e5',
    secondary_color: '#7c3aed',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { dioceses, sectors, loadingDioceses, loadingSectors } = useHierarchyCascade({
    dioceseId: form.dioceseId,
    sectorId: form.sectorId,
    loadSectors: true,
    loadParishes: false,
  });

  useEffect(() => {
    const sectorParam = searchParams.get('sector');
    if (!sectorParam) return;
    pendingSectorRef.current = sectorParam;
    SectorService.show(sectorParam)
      .then((res) => {
        setForm((p) => ({ ...p, dioceseId: res.data.data.diocese_id }));
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pendingSectorRef.current && sectors.length > 0) {
      setForm((p) => ({ ...p, sectorId: pendingSectorRef.current! }));
      pendingSectorRef.current = null;
    }
  }, [sectors]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.dioceseId) next.dioceseId = 'Selecione uma diocese';
    if (!form.sectorId) next.sectorId = 'Selecione um setor';
    if (!form.name.trim()) next.name = 'Nome é obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    const payload: ParishPayload = {
      name: form.name.trim(),
      primary_color: form.primary_color || undefined,
      secondary_color: form.secondary_color || undefined,
    };
    try {
      const res = await ParishService.createInSector(form.sectorId, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      router.push(`/app/parishes/${res.data.data.id}`);
    } catch (err: unknown) {
      setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao criar paróquia.');
    } finally {
      setSubmitting(false);
    }
  }

  const backHref = form.sectorId ? `/app/sectors/${form.sectorId}` : '/app/parishes';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href={backHref}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Nova Paróquia</h1>
          <p className="text-sm text-text-muted mt-0.5">Preencha os dados da nova paróquia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-panel border border-border rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Diocese *" name="dioceseId" value={form.dioceseId}
              onChange={(e) => { set('dioceseId', e.target.value); setForm((p) => ({ ...p, sectorId: '' })); }}
              disabled={!isSuperAdmin || loadingDioceses} error={errors.dioceseId}>
              <option value="">{loadingDioceses ? 'Carregando...' : 'Selecione a diocese'}</option>
              {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>

            <Select label="Setor *" name="sectorId" value={form.sectorId}
              onChange={(e) => set('sectorId', e.target.value)}
              disabled={!form.dioceseId || loadingSectors} error={errors.sectorId}>
              <option value="">{loadingSectors ? 'Carregando...' : !form.dioceseId ? 'Selecione a diocese primeiro' : 'Selecione o setor'}</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>

          <Input label="Nome da Paróquia *" name="name"
            placeholder="Ex: Paróquia Nossa Senhora da Paz"
            value={form.name} onChange={(e) => set('name', e.target.value)}
            error={errors.name} startIcon={<Building2 size={16} />} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorPicker label="Cor primária" id="primary_color"
              value={form.primary_color} onChange={(v) => set('primary_color', v)} />
            <ColorPicker label="Cor secundária" id="secondary_color"
              value={form.secondary_color} onChange={(v) => set('secondary_color', v)} />
          </div>

          {submitError && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{submitError}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <Link href={backHref}><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit" loading={submitting}>Criar Paróquia</Button>
        </div>
      </form>
    </div>
  );
};

export default NewParish;
