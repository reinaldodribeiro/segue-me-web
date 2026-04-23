'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, Mail, User as UserIcon, Lock, ShieldCheck } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { UserPayload } from '@/interfaces/User';
import { UserRole, ROLE_LABELS } from '@/types/roles';
import AdminUserService from '@/services/api/AdminUserService';
import MovementService from '@/services/api/MovementService';
import { Movement } from '@/interfaces/Movement';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useHierarchyCascade } from '@/hooks/useHierarchyCascade';
import { queryKeys } from '@/lib/query/keys';
import { cn } from '@/utils/helpers';
import { useTutorial } from '@/hooks/useTutorial';

const SECTOR_ROLES: UserRole[] = ['sector_admin'];
const PARISH_ROLES: UserRole[] = ['parish_admin', 'coordinator'];

interface FormState {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: UserRole | '';
  dioceseId: string;
  sectorId: string;
  parishId: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
  dioceseId?: string;
  sectorId?: string;
  parishId?: string;
}

const NewUser: React.FC = () => {
  useTutorial();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuperAdmin, isDioceseAdmin, isSectorAdmin, isParishAdmin } = usePermissions();
  const { user } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: '', email: '', password: '', password_confirmation: '',
    role: '', dioceseId: '', sectorId: '', parishId: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Movement access (for coordinators)
  const [allMovements, setAllMovements] = useState<Movement[]>([]);
  const [selectedMovementIds, setSelectedMovementIds] = useState<string[]>([]);

  useEffect(() => {
    if (isDioceseAdmin && user?.diocese_id) {
      setForm((p) => ({ ...p, dioceseId: user.diocese_id! }));
    }
    if (isSectorAdmin && user?.sector_id) {
      setForm((p) => ({
        ...p,
        dioceseId: user.diocese_id ?? '',
        sectorId: user.sector_id!,
      }));
    }
    if (isParishAdmin && user?.parish_id) {
      setForm((p) => ({
        ...p,
        dioceseId: user.diocese_id ?? '',
        sectorId: user.sector_id ?? '',
        parishId: user.parish_id!,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCoordinatorRole = form.role === 'coordinator';

  useEffect(() => {
    if (!isCoordinatorRole) { setAllMovements([]); setSelectedMovementIds([]); return; }
    async function load() {
      try {
        const res = await MovementService.list({ per_page: 200 });
        const movements = res.data.data ?? [];
        setAllMovements(movements);
        setSelectedMovementIds(movements.map((m) => m.id));
      } catch {
      }
    }
    load();
  }, [isCoordinatorRole]);

  const needsSector = !!form.role && (SECTOR_ROLES.includes(form.role as UserRole) || PARISH_ROLES.includes(form.role as UserRole));
  const needsParish = !!form.role && PARISH_ROLES.includes(form.role as UserRole);
  const needsDiocese = !!form.role && ['diocese_admin', ...SECTOR_ROLES, ...PARISH_ROLES].includes(form.role);

  const { dioceses, sectors, parishes, loadingDioceses, loadingSectors, loadingParishes } =
    useHierarchyCascade({
      dioceseId: form.dioceseId,
      sectorId: form.sectorId,
      loadSectors: needsSector,
      loadParishes: needsParish,
    });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }

  function handleRoleChange(role: UserRole | '') {
    setForm((p) => ({
      ...p,
      role,
      dioceseId: isSuperAdmin ? '' : p.dioceseId,
      sectorId: isSectorAdmin || isParishAdmin ? p.sectorId : '',
      parishId: isParishAdmin ? p.parishId : '',
    }));
    setErrors((p) => ({ ...p, role: undefined, dioceseId: undefined, sectorId: undefined, parishId: undefined }));
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = 'Nome é obrigatório';
    if (!form.email.trim()) next.email = 'E-mail é obrigatório';
    if (!form.password) next.password = 'Senha é obrigatória';
    else if (form.password.length < 8) next.password = 'Mínimo 8 caracteres';
    if (form.password !== form.password_confirmation) next.password_confirmation = 'As senhas não coincidem';
    if (!form.role) next.role = 'Selecione um perfil';
    if (form.role && ['diocese_admin', ...SECTOR_ROLES, ...PARISH_ROLES].includes(form.role) && !form.dioceseId) next.dioceseId = 'Selecione uma diocese';
    if (needsSector && !form.sectorId) next.sectorId = 'Selecione um setor';
    if (needsParish && !form.parishId) next.parishId = 'Selecione uma paróquia';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    const payload: UserPayload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      password_confirmation: form.password_confirmation,
      role: form.role as UserRole,
      diocese_id: form.dioceseId || null,
      sector_id: form.sectorId || null,
      parish_id: form.parishId || null,
    };
    try {
      const res = await AdminUserService.create(payload);
      const newUserId = res.data.data.id;

      // Sync movement access for coordinators
      if (isCoordinatorRole) {
        await AdminUserService.syncMovements(newUserId, selectedMovementIds);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      router.push(`/app/users/${newUserId}`);
    } catch (err: unknown) {
      setSubmitError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao criar usuário.');
    } finally {
      setSubmitting(false);
    }
  }

  const availableRoles: UserRole[] = isSuperAdmin
    ? ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']
    : isDioceseAdmin
    ? ['sector_admin', 'parish_admin', 'coordinator']
    : isSectorAdmin
    ? ['parish_admin', 'coordinator']
    : ['coordinator'];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/app/users">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-text">Novo Usuário</h1>
          <p className="text-sm text-text-muted mt-0.5">Preencha os dados do novo usuário</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-panel border border-border rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" data-tutorial="new-user-basic">
            <Input label="Nome *" name="name" placeholder="Nome completo"
              value={form.name} onChange={(e) => set('name', e.target.value)}
              error={errors.name} startIcon={<UserIcon size={16} />} />
            <Input label="E-mail *" name="email" type="email" placeholder="email@exemplo.com"
              value={form.email} onChange={(e) => set('email', e.target.value)}
              error={errors.email} startIcon={<Mail size={16} />} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Senha *" name="password" type="password" placeholder="Mínimo 8 caracteres"
              value={form.password} onChange={(e) => set('password', e.target.value)}
              error={errors.password} startIcon={<Lock size={16} />} />
            <Input label="Confirmar senha *" name="password_confirmation" type="password" placeholder="Repita a senha"
              value={form.password_confirmation} onChange={(e) => set('password_confirmation', e.target.value)}
              error={errors.password_confirmation} startIcon={<Lock size={16} />} />
          </div>

          <div data-tutorial="new-user-role">
            <Select label="Perfil *" name="role" value={form.role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole | '')}
              error={errors.role}>
              <option value="">Selecione o perfil</option>
              {availableRoles.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </Select>
          </div>

          <div data-tutorial="new-user-hierarchy">
          {needsDiocese && isSuperAdmin && (
            <Select label="Diocese *" name="dioceseId" value={form.dioceseId}
              onChange={(e) => { set('dioceseId', e.target.value); setForm((p) => ({ ...p, sectorId: '', parishId: '' })); }}
              disabled={loadingDioceses} error={errors.dioceseId}>
              <option value="">{loadingDioceses ? 'Carregando...' : 'Selecione a diocese'}</option>
              {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          )}

          {needsSector && (isSuperAdmin || isDioceseAdmin) && (
            <Select label="Setor *" name="sectorId" value={form.sectorId}
              onChange={(e) => { set('sectorId', e.target.value); setForm((p) => ({ ...p, parishId: '' })); }}
              disabled={!form.dioceseId || loadingSectors} error={errors.sectorId}>
              <option value="">{loadingSectors ? 'Carregando...' : !form.dioceseId ? 'Selecione a diocese primeiro' : 'Selecione o setor'}</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          )}

          {needsParish && (
            <Select label="Paróquia *" name="parishId" value={form.parishId}
              onChange={(e) => set('parishId', e.target.value)}
              disabled={!form.sectorId || loadingParishes} error={errors.parishId}>
              <option value="">{loadingParishes ? 'Carregando...' : !form.sectorId ? 'Selecione o setor primeiro' : 'Selecione a paróquia'}</option>
              {parishes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          )}
          </div>

          {/* Movement access (coordinators) */}
          {isCoordinatorRole && allMovements.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Acesso a Movimentos</label>
              <p className="text-xs text-text-muted">Selecione quais movimentos este coordenador poderá acessar.</p>
              <div className="flex flex-wrap gap-2">
                {allMovements.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setSelectedMovementIds((prev) =>
                        prev.includes(m.id)
                          ? prev.filter((id) => id !== m.id)
                          : [...prev, m.id]
                      )
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      selectedMovementIds.includes(m.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-hover text-text-muted border-border hover:border-primary/40',
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">{submitError}</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 mt-4">
          <Link href="/app/users"><Button variant="secondary" type="button">Cancelar</Button></Link>
          <Button type="submit" loading={submitting} leftIcon={<ShieldCheck size={16} />}>Criar Usuário</Button>
        </div>
      </form>
    </div>
  );
};

export default NewUser;
