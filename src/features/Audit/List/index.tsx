'use client';

import { useMemo, useState } from 'react';
import { Search, RefreshCw, ClipboardList } from 'lucide-react';
import Input from '@/components/Input';
import DateInput from '@/components/DateInput';
import Pagination from '@/components/Pagination';
import { useAuditList } from '@/lib/query/hooks/useAudit';
import { useDebounce } from '@/hooks/useDebounce';
import { useTutorial } from '@/hooks/useTutorial';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function actionBadge(action: string) {
  if (/delet|destroy|remov/.test(action))
    return 'text-red-600 bg-red-50 border-red-200';
  if (/creat|store|add/.test(action))
    return 'text-green-700 bg-green-50 border-green-200';
  if (/updat|chang|edit/.test(action))
    return 'text-blue-600 bg-blue-50 border-blue-200';
  if (/toggl|activ/.test(action))
    return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-text-muted bg-hover border-border';
}

const AuditList: SafeFC = () => {
  useTutorial();
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const params = useMemo(() => {
    const p: Record<string, unknown> = { per_page: 25, page };
    if (debouncedSearch) p.search = debouncedSearch;
    if (from) p.from = from;
    if (to) p.to = to;
    return p;
  }, [page, debouncedSearch, from, to]);

  const { data, isLoading: loading, isError } = useAuditList(params);
  const logs = data?.data ?? [];
  const meta = data?.meta ?? null;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }

  function handleFromChange(e: { target: { value: string } }) {
    setFrom(e.target.value);
    setPage(1);
  }

  function handleToChange(e: { target: { value: string } }) {
    setTo(e.target.value);
    setPage(1);
  }

  function clearFilters() {
    setSearch(''); setFrom(''); setTo(''); setPage(1);
  }

  const hasFilters = search || from || to;
  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      <div data-tutorial="audit-header">
        <h1 className="text-xl font-bold text-text">Auditoria</h1>
        <p className="text-sm text-text-muted mt-0.5">
          {loading ? 'Carregando...' : `${total} registro${total !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="audit-filters">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            name="search"
            placeholder="Buscar na descrição ou ação..."
            value={search}
            onChange={handleSearchChange}
            startIcon={<Search size={15} />}
          />
          <DateInput
            name="from"
            value={from}
            onChange={handleFromChange}
          />
          <DateInput
            name="to"
            value={to}
            onChange={handleToChange}
          />
        </div>
        {hasFilters && (
          <div className="mt-3">
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="audit-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando registros...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar logs de auditoria.</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList size={40} className="mx-auto mb-3 text-text-muted/30" />
            <p className="text-sm font-medium text-text-muted">
              {hasFilters ? 'Nenhum registro encontrado' : 'Nenhum log de auditoria'}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-2 text-sm text-primary hover:underline">
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-hover/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted whitespace-nowrap">Data/Hora</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Usuário</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Ação</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Descrição</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted whitespace-nowrap">Entidade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-hover/30 transition-colors">
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div>
                            <p className="font-medium text-text text-xs">{log.user.name}</p>
                            <p className="text-text-muted text-xs">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border text-xs font-mono ${actionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text text-xs max-w-sm">
                        {log.description}
                      </td>
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {log.model_type ? (
                          <span className="font-mono">{log.model_type}</span>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
};

export default AuditList;
