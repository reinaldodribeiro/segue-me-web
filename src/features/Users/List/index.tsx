'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Users, RefreshCw, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Pagination from '@/components/Pagination';
import { User } from '@/interfaces/User';
import { UserRole, ROLE_LABELS } from '@/types/roles';
import { useUserList } from '@/lib/query/hooks/useUsers';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { useTutorial } from '@/hooks/useTutorial';

function normalizeRole(r: UserRole | { name: string }): UserRole {
  return (typeof r === 'string' ? r : r.name) as UserRole;
}

function getUserRole(user: User): UserRole | null {
  if (!user.roles?.length) return null;
  return normalizeRole(user.roles[0]);
}

type StatusFilter = 'all' | 'active' | 'inactive';

const UsersList: React.FC = () => {
  useTutorial();
  const { isSuperAdmin, isDioceseAdmin } = usePermissions();

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | ''>('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const params: Record<string, unknown> = { per_page: 20, page };
  if (debouncedSearch) params.search = debouncedSearch;
  if (filterRole) params.role = filterRole;
  if (filterStatus === 'active') params.active = 1;
  if (filterStatus === 'inactive') params.active = 0;

  const { data, isLoading: loading, isError } = useUserList(params);
  const users = data?.data ?? [];
  const meta = data?.meta ?? null;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterRole(e.target.value as UserRole | '');
    setPage(1);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value as StatusFilter);
    setPage(1);
  }

  const hasFilters = search || filterRole || filterStatus !== 'all';

  function clearFilters() {
    setSearch(''); setFilterRole(''); setFilterStatus('all'); setPage(1);
  }

  const roleOptions: UserRole[] = isSuperAdmin
    ? ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']
    : isDioceseAdmin
    ? ['sector_admin', 'parish_admin', 'coordinator']
    : ['parish_admin', 'coordinator'];

  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4" data-tutorial="users-header">
        <div>
          <h1 className="text-xl font-bold text-text">Usuários</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading ? 'Carregando...' : `${total} usuário${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/app/users/new" data-tutorial="users-new-btn">
          <Button leftIcon={<Plus size={16} />}>Novo Usuário</Button>
        </Link>
      </div>

      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="users-filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            name="search"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={handleSearchChange}
            startIcon={<Search size={15} />}
          />
          <Select name="filterRole" value={filterRole} onChange={handleRoleChange}>
            <option value="">Todos os perfis</option>
            {roleOptions.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
          <Select name="filterStatus" value={filterStatus} onChange={handleStatusChange}>
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </Select>
        </div>
        {hasFilters && (
          <div className="mt-3 flex items-center gap-2">
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">Limpar filtros</button>
          </div>
        )}
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="users-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando usuários...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar usuários.</div>
        ) : users.length === 0 ? (
          <div className="py-20 text-center">
            {hasFilters ? (
              <>
                <Search size={36} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">Nenhum usuário encontrado</p>
                <button onClick={clearFilters} className="mt-2 text-sm text-primary hover:underline">
                  Limpar filtros
                </button>
              </>
            ) : (
              <>
                <Users size={40} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">Nenhum usuário cadastrado</p>
                <Link href="/app/users/new">
                  <Button variant="ghost" size="sm" className="mt-3" leftIcon={<Plus size={14} />}>
                    Criar usuário
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-hover/30">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Usuário</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Perfil</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Paróquia</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const role = getUserRole(user);
                  return (
                    <tr key={user.id} className="hover:bg-hover/40 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-text">{user.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {role ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                            <ShieldCheck size={13} />
                            {ROLE_LABELS[role] ?? role}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs">{user.parish?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {user.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                            <CheckCircle2 size={13} /> Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
                            <XCircle size={13} /> Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/app/users/${user.id}`}>
                          <Button variant="ghost" size="sm">Editar</Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
};

export default UsersList;
