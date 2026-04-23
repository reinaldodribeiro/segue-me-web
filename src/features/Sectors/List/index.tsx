'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Map, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Pagination from '@/components/Pagination';
import { usePermissions } from '@/hooks/usePermissions';
import { useDebounce } from '@/hooks/useDebounce';
import { useSectorList } from '@/lib/query/hooks/useSectors';
import { useHierarchyDioceses } from '@/lib/query/hooks/useHierarchy';
import { cn } from '@/utils/helpers';
import { useTutorial } from '@/hooks/useTutorial';

type StatusFilter = 'all' | 'active' | 'inactive';

const SectorsList: SafeFC = () => {
  useTutorial();
  const { isSuperAdmin } = usePermissions();

  const [search, setSearch] = useState('');
  const [filterDiocese, setFilterDiocese] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const params: Record<string, unknown> = { per_page: 20, page };
  if (debouncedSearch) params.name = debouncedSearch;
  if (filterDiocese) params.diocese_id = filterDiocese;
  if (filterStatus === 'active') params.active = 1;
  if (filterStatus === 'inactive') params.active = 0;

  const { data, isLoading: loading, isError } = useSectorList(params);
  const sectors = data?.data ?? [];
  const meta = data?.meta ?? null;

  const { data: dioceses = [] } = useHierarchyDioceses(isSuperAdmin);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleDioceseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterDiocese(e.target.value);
    setPage(1);
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setFilterStatus(e.target.value as StatusFilter);
    setPage(1);
  }

  const hasFilters = search || filterDiocese || filterStatus !== 'all';

  function clearFilters() {
    setSearch(''); setFilterDiocese(''); setFilterStatus('all'); setPage(1);
  }

  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4" data-tutorial="sectors-header">
        <div>
          <h1 className="text-xl font-bold text-text">Setores</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading ? 'Carregando...' : `${total} setor${total !== 1 ? 'es' : ''}`}
          </p>
        </div>
        <Link href="/app/sectors/new" data-tutorial="sectors-new-btn">
          <Button leftIcon={<Plus size={16} />}>Novo Setor</Button>
        </Link>
      </div>

      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="sectors-filters">
        <div className={cn('grid gap-3', isSuperAdmin ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2')}>
          <Input
            name="search"
            placeholder="Buscar pelo nome..."
            value={search}
            onChange={handleSearchChange}
            startIcon={<Search size={15} />}
          />
          {isSuperAdmin && (
            <Select name="filterDiocese" value={filterDiocese} onChange={handleDioceseChange}>
              <option value="">Todas as dioceses</option>
              {dioceses.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          )}
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

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="sectors-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando setores...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar setores.</div>
        ) : sectors.length === 0 ? (
          <div className="py-20 text-center">
            {hasFilters ? (
              <>
                <Search size={36} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">Nenhum setor encontrado</p>
                <button onClick={clearFilters} className="mt-2 text-sm text-primary hover:underline">
                  Limpar filtros
                </button>
              </>
            ) : (
              <>
                <Map size={40} className="mx-auto mb-3 text-text-muted/30" />
                <p className="text-sm font-medium text-text-muted">Nenhum setor cadastrado</p>
                <Link href="/app/sectors/new">
                  <Button variant="ghost" size="sm" className="mt-3" leftIcon={<Plus size={14} />}>
                    Criar setor
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
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Setor</th>
                  {isSuperAdmin && (
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Diocese</th>
                  )}
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Slug</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sectors.map((sector) => (
                  <tr key={sector.id} className="hover:bg-hover/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{sector.name}</td>
                    {isSuperAdmin && (
                      <td className="px-4 py-3 text-text-muted text-xs">{sector.diocese?.name ?? '—'}</td>
                    )}
                    <td className="px-4 py-3 text-text-muted font-mono text-xs">{sector.slug}</td>
                    <td className="px-4 py-3">
                      {sector.active ? (
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
                      <Link href={`/app/sectors/${sector.id}`}>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
};

export default SectorsList;
