'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Landmark, Plus, RefreshCw, Trash2, Map } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import DioceseService from '@/services/api/DioceseService';
import { useDiocese } from '@/lib/query/hooks/useDioceses';
import { useHierarchySectors } from '@/lib/query/hooks/useHierarchy';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';

interface FormState {
  name: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
}

const DioceseDetail: SafeFC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { data: diocese, isLoading: loadingPage, isError: dioceseError } = useDiocese(id);
  const { data: sectors = [], isLoading: loadingSectors } = useHierarchySectors(id);

  const [form, setForm] = useState<FormState>({ name: '', active: true });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const initializedRef = useRef<string | null>(null);
  useEffect(() => {
    if (dioceseError) { router.replace('/app/dioceses'); return; }
    if (!diocese || initializedRef.current === id) return;
    initializedRef.current = id;
    setForm({ name: diocese.name, active: diocese.active });
  }, [diocese, dioceseError, router, id]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Nome é obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true); setSubmitError(''); setSuccessMsg('');
    try {
      await DioceseService.update(id, { name: form.name.trim(), active: form.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.dioceses.detail(id) });
      setSuccessMsg('Diocese atualizada com sucesso.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao atualizar diocese.');
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await DioceseService.delete(id);
      router.push('/app/dioceses');
    } catch (err: unknown) {
      setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao excluir diocese.');
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

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/dioceses">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text">{diocese?.name}</h1>
            <p className="text-xs text-text-muted font-mono mt-0.5">{diocese?.slug}</p>
          </div>
        </div>
        <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => setConfirmDelete(true)}>
          Excluir
        </Button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-panel border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-text">Dados da Diocese</h2>
          <Input
            label="Nome *" name="name" placeholder="Ex: Diocese de São Paulo"
            value={form.name}
            onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: undefined })); }}
            error={errors.name} startIcon={<Landmark size={16} />}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Diocese ativa</p>
              <p className="text-xs text-text-muted mt-0.5">Dioceses inativas não aparecem para seleção</p>
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
          <h2 className="text-sm font-semibold text-text">Setores</h2>
          <Link href={`/app/sectors/new?diocese=${id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Plus size={14} />}>Novo Setor</Button>
          </Link>
        </div>
        {loadingSectors ? (
          <div className="flex items-center justify-center gap-2 py-10 text-text-muted">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-sm">Carregando setores...</span>
          </div>
        ) : sectors.length === 0 ? (
          <div className="py-10 text-center">
            <Map size={28} className="mx-auto mb-2 text-text-muted/40" />
            <p className="text-sm text-text-muted">Nenhum setor cadastrado nesta diocese.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-hover/30">
              <tr>
                <th className="px-4 py-2.5 text-left font-semibold text-text-muted">Nome</th>
                <th className="px-4 py-2.5 text-left font-semibold text-text-muted">Slug</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sectors.map((sector) => (
                <tr key={sector.id} className="hover:bg-hover/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{sector.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{sector.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/app/sectors/${sector.id}`}>
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
              <h3 className="text-base font-bold text-text">Excluir diocese?</h3>
              <p className="text-sm text-text-muted mt-1">
                Esta ação é irreversível. Todos os setores e paróquias vinculados serão afetados.
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

export default DioceseDetail;
