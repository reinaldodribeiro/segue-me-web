'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Map, Plus, RefreshCw, Trash2, Building2 } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import SectorService from '@/services/api/SectorService';
import { useSector } from '@/lib/query/hooks/useSectors';
import { useHierarchyParishes } from '@/lib/query/hooks/useHierarchy';
import { cn } from '@/utils/helpers';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

interface FormState {
  name: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
}

const SectorDetail: SafeFC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { data: sector, isLoading: loadingPage, isError: sectorError } = useSector(id);
  const { data: parishes = [], isLoading: loadingParishes } = useHierarchyParishes(id);

  const [form, setForm] = useState<FormState>({ name: '', active: true });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (sectorError) { router.replace('/app/sectors'); return; }
    if (sector) setForm({ name: sector.name, active: sector.active });
  }, [sector, sectorError, router]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Nome é obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true); setSubmitError(''); setSuccessMsg('');
    try {
      await SectorService.update(id, { name: form.name.trim(), active: form.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.detail(id) });
      setSuccessMsg('Setor atualizado com sucesso.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao atualizar setor.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await SectorService.delete(id);
      router.push(sector?.diocese_id ? `/app/dioceses/${sector.diocese_id}` : '/app/sectors');
    } catch (err: unknown) {
      setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao excluir setor.');
      setConfirmDelete(false);
    } finally { setDeleting(false); }
  }

  if (loadingPage) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-text-muted">
        <RefreshCw size={18} className="animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  const backHref = sector?.diocese_id ? `/app/dioceses/${sector.diocese_id}` : '/app/sectors';

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text">{sector?.name}</h1>
            <p className="text-xs text-text-muted font-mono mt-0.5">
              {sector?.slug}
              {sector?.diocese && (
                <span className="ml-2 not-italic font-sans">· {sector.diocese.name}</span>
              )}
            </p>
          </div>
        </div>
        <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setConfirmDelete(true)}>
          Excluir
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-panel border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-text">Dados do Setor</h2>
          <Input
            label="Nome *" name="name" placeholder="Ex: Setor Norte"
            value={form.name}
            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: undefined })); }}
            error={errors.name} startIcon={<Map size={16} />}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Setor ativo</p>
              <p className="text-xs text-text-muted mt-0.5">Setores inativos não aparecem para seleção</p>
            </div>
            <Toggle checked={form.active} onChange={() => setForm((p) => ({ ...p, active: !p.active }))} />
          </div>
          {submitError && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{submitError}</p>
          )}
          {successMsg && (
            <p className="text-sm text-green-600 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">{successMsg}</p>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button type="submit" loading={submitting}>Salvar Alterações</Button>
        </div>
      </form>

      <div className="bg-panel border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Paróquias</h2>
          <Link href={`/app/parishes/new?sector=${id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>Nova Paróquia</Button>
          </Link>
        </div>
        {loadingParishes ? (
          <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Carregando paróquias...</span>
          </div>
        ) : parishes.length === 0 ? (
          <div className="py-10 text-center">
            <Building2 size={28} className="mx-auto mb-2 text-text-muted/40" />
            <p className="text-sm text-text-muted">Nenhuma paróquia cadastrada neste setor.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-hover/30">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-text-muted">Nome</th>
                <th className="px-4 py-2.5 text-left font-semibold text-text-muted">Slug</th>
                <th className="px-4 py-2.5 text-left font-semibold text-text-muted">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {parishes.map((parish) => (
                <tr key={parish.id} className="hover:bg-hover/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{parish.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{parish.slug}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      parish.active ? 'bg-green-500/15 text-green-600' : 'bg-gray-500/15 text-gray-500',
                    )}>
                      {parish.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/app/parishes/${parish.id}`}>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div>
              <h3 className="text-base font-bold text-text">Excluir setor?</h3>
              <p className="text-sm text-text-muted mt-1">
                Esta ação é irreversível. Todas as paróquias vinculadas serão afetadas.
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
              <Button variant="danger" loading={deleting} onClick={handleDelete}>Confirmar Exclusão</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectorDetail;
