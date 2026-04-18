'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Layers, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Pagination from '@/components/Pagination';
import { Movement, MOVEMENT_SCOPE_LABELS, ACCEPTED_TYPE_LABELS } from '@/interfaces/Movement';
import { useMovementList } from '@/lib/query/hooks/useMovements';
import { useDebounce } from '@/hooks/useDebounce';
import { useTutorial } from '@/hooks/useTutorial';

const MovementsList: React.FC = () => {
  useTutorial();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading: loading, isError } = useMovementList({ per_page: 20, page });
  const movements = data?.data ?? [];
  const meta = data?.meta ?? null;

  const filtered = debouncedSearch
    ? movements.filter((m: Movement) => m.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : movements;

  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4" data-tutorial="movements-header">
        <div>
          <h1 className="text-xl font-bold text-text">Movimentos</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading ? 'Carregando...' : `${total} movimento${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/app/movements/new" data-tutorial="movements-new-btn">
          <Button leftIcon={<Plus size={16} />}>Novo Movimento</Button>
        </Link>
      </div>

      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="movements-search">
        <Input
          name="search"
          placeholder="Buscar pelo nome..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          startIcon={<Search size={15} />}
        />
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="movements-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando movimentos...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar movimentos.</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Layers size={40} className="mx-auto mb-3 text-text-muted/30" />
            <p className="text-sm font-medium text-text-muted">Nenhum movimento cadastrado</p>
            <Link href="/app/movements/new">
              <Button variant="ghost" size="sm" className="mt-3" leftIcon={<Plus size={14} />}>Criar movimento</Button>
            </Link>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-hover/30">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Nome</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Público</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Âmbito</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Equipes</th>
                  <th className="px-4 py-3 text-left font-semibold text-text-muted">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((m: Movement) => (
                  <tr key={m.id} className="hover:bg-hover/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-text">{m.name}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{ACCEPTED_TYPE_LABELS[m.target_audience]}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{MOVEMENT_SCOPE_LABELS[m.scope]}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">{m.teams_count ?? 0}</td>
                    <td className="px-4 py-3">
                      {m.active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600"><CheckCircle2 size={13} /> Ativo</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted"><XCircle size={13} /> Inativo</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/app/movements/${m.id}`}>
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

export default MovementsList;
