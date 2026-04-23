'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Landmark } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Toggle from '@/components/Toggle';
import DioceseService from '@/services/api/DioceseService';
import { queryKeys } from '@/lib/query/keys';

interface FormState {
  name: string;
  active: boolean;
}

interface FormErrors {
  name?: string;
}

const NewDiocese: SafeFC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>({ name: '', active: true });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Nome é obrigatório';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await DioceseService.save({ name: form.name.trim(), active: form.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.dioceses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
      router.push(`/app/dioceses/${res.data.data.id}`);
    } catch (err: unknown) {
      setSubmitError(
        (err as { data?: { message?: string } })?.data?.message ?? 'Erro ao criar diocese. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/dioceses">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Nova Diocese</h1>
          <p className="text-sm text-text-muted mt-0.5">Preencha os dados da diocese</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-panel border border-border rounded-xl p-6 space-y-5">
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
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              {submitError}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <Link href="/app/dioceses">
            <Button variant="secondary" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" loading={submitting}>Criar Diocese</Button>
        </div>
      </form>
    </div>
  );
};

export default NewDiocese;
