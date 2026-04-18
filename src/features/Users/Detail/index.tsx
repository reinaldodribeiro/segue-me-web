'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, User as UserIcon, Lock, ShieldCheck, RefreshCw, Trash2, ToggleLeft, BookOpen } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import SectionCard from '@/components/SectionCard';
import FeedbackMsg from '@/components/FeedbackMsg';
import { UserPayload } from '@/interfaces/User';
import { UserRole, ROLE_LABELS } from '@/types/roles';
import AdminUserService from '@/services/api/AdminUserService';
import { useUser } from '@/lib/query/hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { useHierarchyCascade } from '@/hooks/useHierarchyCascade';
import { cn } from '@/utils/helpers';

function normalizeRole(r: UserRole | { name: string }): UserRole {
  return (typeof r === 'string' ? r : r.name) as UserRole;
}

const SECTOR_ROLES: UserRole[] = ['sector_admin'];
const PARISH_ROLES: UserRole[] = ['parish_admin', 'coordinator'];

interface InfoForm {
  name: string;
  email: string;
  role: UserRole | '';
  dioceseId: string;
  sectorId: string;
  parishId: string;
}

interface InfoErrors {
  name?: string;
  email?: string;
  role?: string;
  dioceseId?: string;
  sectorId?: string;
  parishId?: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isSuperAdmin, isDioceseAdmin, isSectorAdmin } = usePermissions();
  const { user: authUser } = useAuth();

  const queryClient = useQueryClient();
  const { data: targetUser, isLoading: loading, isError: userError } = useUser(id);

  const [infoForm, setInfoForm] = useState<InfoForm>({
    name: '', email: '', role: '', dioceseId: '', sectorId: '', parishId: '',
  });
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({});
  const [infoError, setInfoError] = useState('');
  const [infoSuccess, setInfoSuccess] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  const [pwForm, setPwForm] = useState({ password: '', password_confirmation: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [savingPw, setSavingPw] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [togglingActive, setTogglingActive] = useState(false);

  // Movement access
  const [allMovements, setAllMovements] = useState<{ id: string; name: string }[]>([]);
  const [userMovementIds, setUserMovementIds] = useState<string[]>([]);
  const [savingMovements, setSavingMovements] = useState(false);
  const [movementsSuccess, setMovementsSuccess] = useState('');

  useEffect(() => {
    if (userError) { router.replace('/app/users'); return; }
    if (!targetUser) return;
    setUserMovementIds(targetUser.movement_ids ?? []);
    const role = targetUser.roles?.length ? normalizeRole(targetUser.roles[0]) : '';
    setInfoForm({
      name: targetUser.name,
      email: targetUser.email,
      role,
      dioceseId: targetUser.diocese_id ?? '',
      sectorId: targetUser.sector_id ?? '',
      parishId: targetUser.parish_id ?? '',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUser, userError]);

  // Load available movements for the parish
  const targetRole = infoForm.role ? infoForm.role : null;
  const hasMovementSection = targetRole === 'coordinator' || targetRole === 'parish_admin';

  useEffect(() => {
    if (!hasMovementSection) return;
    async function load() {
      try {
        const res = await AdminUserService.listMovements(id);
        setAllMovements(res.data.data ?? []);
      } catch {
      }
    }
    load();
  }, [hasMovementSection, id]);

  const needsSector = !!infoForm.role && (SECTOR_ROLES.includes(infoForm.role) || PARISH_ROLES.includes(infoForm.role));
  const needsParish = !!infoForm.role && PARISH_ROLES.includes(infoForm.role);
  const needsDiocese = !!infoForm.role && ['diocese_admin', ...SECTOR_ROLES, ...PARISH_ROLES].includes(infoForm.role);

  const { dioceses, sectors, parishes, loadingDioceses, loadingSectors, loadingParishes } =
    useHierarchyCascade({
      dioceseId: infoForm.dioceseId,
      sectorId: infoForm.sectorId,
      loadSectors: needsSector,
      loadParishes: needsParish,
    });

  function setInfo<K extends keyof InfoForm>(key: K, value: InfoForm[K]) {
    setInfoForm((p) => ({ ...p, [key]: value }));
    setInfoErrors((p) => ({ ...p, [key]: undefined }));
  }

  function handleRoleChange(role: UserRole | '') {
    setInfoForm((p) => ({
      ...p,
      role,
      dioceseId: isSuperAdmin ? '' : p.dioceseId,
      sectorId: isSectorAdmin ? p.sectorId : '',
      parishId: '',
    }));
    setInfoErrors({});
  }

  function validateInfo(): boolean {
    const next: InfoErrors = {};
    if (!infoForm.name.trim()) next.name = 'Nome é obrigatório';
    if (!infoForm.email.trim()) next.email = 'E-mail é obrigatório';
    if (!infoForm.role) next.role = 'Selecione um perfil';
    if (needsDiocese && !infoForm.dioceseId) next.dioceseId = 'Selecione uma diocese';
    if (needsSector && !infoForm.sectorId) next.sectorId = 'Selecione um setor';
    if (needsParish && !infoForm.parishId) next.parishId = 'Selecione uma paróquia';
    setInfoErrors(next);
    return Object.keys(next).length === 0;
  }

  async function saveInfo(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!validateInfo()) return;
    setSavingInfo(true); setInfoError(''); setInfoSuccess('');
    const payload: Partial<UserPayload> = {
      name: infoForm.name.trim(),
      email: infoForm.email.trim(),
      role: infoForm.role as UserRole,
      diocese_id: infoForm.dioceseId || null,
      sector_id: infoForm.sectorId || null,
      parish_id: infoForm.parishId || null,
    };
    try {
      await AdminUserService.update(id, payload);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      setInfoSuccess('Informações salvas com sucesso.');
      setTimeout(() => setInfoSuccess(''), 3000);
    } catch (err: unknown) {
      setInfoError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao salvar.');
    } finally { setSavingInfo(false); }
  }

  async function savePassword(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!pwForm.password) { setPwError('Senha é obrigatória'); return; }
    if (pwForm.password.length < 8) { setPwError('Mínimo 8 caracteres'); return; }
    if (pwForm.password !== pwForm.password_confirmation) { setPwError('As senhas não coincidem'); return; }
    setSavingPw(true); setPwError(''); setPwSuccess('');
    try {
      await AdminUserService.update(id, {
        password: pwForm.password,
        password_confirmation: pwForm.password_confirmation,
      });
      setPwForm({ password: '', password_confirmation: '' });
      setPwSuccess('Senha atualizada com sucesso.');
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: unknown) {
      setPwError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao atualizar senha.');
    } finally { setSavingPw(false); }
  }

  async function handleToggleActive() {
    setTogglingActive(true);
    try {
      await AdminUserService.toggleActive(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
    } catch (err: unknown) {
      setDeleteError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao alterar status.');
    } finally { setTogglingActive(false); }
  }

  async function handleDelete() {
    setDeleting(true); setDeleteError('');
    try {
      await AdminUserService.delete(id);
      router.push('/app/users');
    } catch (err: unknown) {
      setDeleteError((err as { data?: { message?: string } })?.data?.message ?? 'Erro ao excluir usuário.');
      setConfirmDelete(false);
    } finally { setDeleting(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-text-muted">
        <RefreshCw size={18} className="animate-spin" /><span className="text-sm">Carregando...</span>
      </div>
    );
  }

  const availableRoles: UserRole[] = isSuperAdmin
    ? ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']
    : isDioceseAdmin
    ? ['sector_admin', 'parish_admin', 'coordinator']
    : isSectorAdmin
    ? ['parish_admin', 'coordinator']
    : ['coordinator'];

  const isSelf = authUser?.id === id;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/app/users">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />}>Voltar</Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-text">{targetUser?.name}</h1>
            <p className="text-xs text-text-muted mt-0.5">{targetUser?.email}</p>
          </div>
        </div>
        {!isSelf && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" leftIcon={<ToggleLeft size={14} />}
              loading={togglingActive} onClick={handleToggleActive}>
              {targetUser?.active ? 'Desativar' : 'Ativar'}
            </Button>
            <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />}
              onClick={() => setConfirmDelete(true)}>
              Excluir
            </Button>
          </div>
        )}
      </div>

      {isSelf && (
        <p className="text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          Para editar o seu próprio perfil, acesse{' '}
          <Link href="/app/profile" className="underline font-medium">Meu Perfil</Link>.
        </p>
      )}

      <div className="flex items-center gap-2">
        <span className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
          targetUser?.active ? 'bg-green-500/15 text-green-600' : 'bg-gray-500/15 text-gray-500',
        )}>
          {targetUser?.active ? 'Ativo' : 'Inativo'}
        </span>
        {targetUser?.roles?.length ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            <ShieldCheck size={12} />
            {ROLE_LABELS[normalizeRole(targetUser.roles[0])] ?? normalizeRole(targetUser.roles[0])}
          </span>
        ) : null}
      </div>

      <SectionCard title="Informações do Usuário">
        <form onSubmit={saveInfo} noValidate className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome *" name="name" placeholder="Nome completo"
              value={infoForm.name} onChange={(e) => setInfo('name', e.target.value)}
              error={infoErrors.name} startIcon={<UserIcon size={16} />} disabled={isSelf} />
            <Input label="E-mail *" name="email" type="email" placeholder="email@exemplo.com"
              value={infoForm.email} onChange={(e) => setInfo('email', e.target.value)}
              error={infoErrors.email} startIcon={<Mail size={16} />} disabled={isSelf} />
          </div>

          <Select label="Perfil *" name="role" value={infoForm.role}
            onChange={(e) => handleRoleChange(e.target.value as UserRole | '')}
            error={infoErrors.role} disabled={isSelf}>
            <option value="">Selecione o perfil</option>
            {availableRoles.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>

          {needsDiocese && isSuperAdmin && (
            <Select label="Diocese *" name="dioceseId" value={infoForm.dioceseId}
              onChange={(e) => { setInfo('dioceseId', e.target.value); setInfoForm((p) => ({ ...p, sectorId: '', parishId: '' })); }}
              disabled={loadingDioceses || isSelf} error={infoErrors.dioceseId}>
              <option value="">Selecione a diocese</option>
              {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          )}

          {needsSector && (isSuperAdmin || isDioceseAdmin) && (
            <Select label="Setor *" name="sectorId" value={infoForm.sectorId}
              onChange={(e) => { setInfo('sectorId', e.target.value); setInfoForm((p) => ({ ...p, parishId: '' })); }}
              disabled={!infoForm.dioceseId || loadingSectors || isSelf} error={infoErrors.sectorId}>
              <option value="">{loadingSectors ? 'Carregando...' : !infoForm.dioceseId ? 'Selecione a diocese primeiro' : 'Selecione o setor'}</option>
              {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          )}

          {needsParish && (
            <Select label="Paróquia *" name="parishId" value={infoForm.parishId}
              onChange={(e) => setInfo('parishId', e.target.value)}
              disabled={!infoForm.sectorId || loadingParishes || isSelf} error={infoErrors.parishId}>
              <option value="">{loadingParishes ? 'Carregando...' : !infoForm.sectorId ? 'Selecione o setor primeiro' : 'Selecione a paróquia'}</option>
              {parishes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          )}

          <FeedbackMsg error={infoError} success={infoSuccess} />

          {!isSelf && (
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={savingInfo}>Salvar Informações</Button>
            </div>
          )}
        </form>
      </SectionCard>

      {/* Movement Access (coordinators and parish admins) */}
      {hasMovementSection && !isSelf && (
        <SectionCard title="Acesso a Movimentos" action={<BookOpen size={15} className="text-text-muted" />}>
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Selecione quais movimentos este usuário pode acessar. Somente encontros desses movimentos ficarão visíveis.
            </p>
            {allMovements.length === 0 ? (
              <p className="text-sm text-text-muted">Nenhum movimento cadastrado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allMovements.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setUserMovementIds((prev) =>
                        prev.includes(m.id)
                          ? prev.filter((id) => id !== m.id)
                          : [...prev, m.id]
                      )
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border',
                      userMovementIds.includes(m.id)
                        ? 'bg-primary text-white border-primary'
                        : 'bg-hover text-text-muted border-border hover:border-primary/40',
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}
            <FeedbackMsg success={movementsSuccess} />
            <div className="flex justify-end">
              <Button
                size="sm"
                loading={savingMovements}
                onClick={async () => {
                  setSavingMovements(true);
                  setMovementsSuccess('');
                  try {
                    await AdminUserService.syncMovements(id, userMovementIds);
                    queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
                    setMovementsSuccess('Acesso a movimentos atualizado.');
                    setTimeout(() => setMovementsSuccess(''), 3000);
                  } catch {
                    // error handled silently
                  } finally {
                    setSavingMovements(false);
                  }
                }}
              >
                Salvar Movimentos
              </Button>
            </div>
          </div>
        </SectionCard>
      )}

      {!isSelf && (
        <SectionCard title="Redefinir Senha">
          <form onSubmit={savePassword} noValidate className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nova senha *" name="password" type="password" placeholder="Mínimo 8 caracteres"
                value={pwForm.password} onChange={(e) => setPwForm((p) => ({ ...p, password: e.target.value }))}
                startIcon={<Lock size={16} />} />
              <Input label="Confirmar senha *" name="password_confirmation" type="password" placeholder="Repita a senha"
                value={pwForm.password_confirmation} onChange={(e) => setPwForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                startIcon={<Lock size={16} />} />
            </div>
            <FeedbackMsg error={pwError} success={pwSuccess} />
            <div className="flex justify-end">
              <Button type="submit" size="sm" loading={savingPw}>Atualizar Senha</Button>
            </div>
          </form>
        </SectionCard>
      )}

      {deleteError && <FeedbackMsg error={deleteError} />}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-panel border border-border rounded-xl p-6 w-full max-w-sm mx-4 space-y-4">
            <div>
              <h3 className="text-base font-bold text-text">Excluir usuário?</h3>
              <p className="text-sm text-text-muted mt-1">
                Esta ação é irreversível. O usuário perderá todo o acesso ao sistema.
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

export default UserDetail;
