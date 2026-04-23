'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, CalendarDays, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Pagination from '@/components/Pagination';
import SortableTable from '@/components/SortableTable';
import type { ColumnDef } from '@/components/SortableTable/types';
import { Encounter, EncounterStatus, ENCOUNTER_STATUS_LABELS } from '@/interfaces/Encounter';
import { useEncounterList } from '@/lib/query/hooks/useEncounters';
import { useDebounce } from '@/hooks/useDebounce';
import { useTutorial } from '@/hooks/useTutorial';

const STATUS_COLORS: Record<EncounterStatus, string> = {
  draft: 'text-text-muted bg-hover',
  confirmed: 'text-blue-600 bg-blue-50',
  completed: 'text-green-600 bg-green-50',
};

/** Parses "d/m/Y" → YYYYMMDD number for date comparison. */
function parseBRDate(s: string | null | undefined): number {
  if (!s || s === '—') return 0;
  const [d, m, y] = s.split('/');
  if (!d || !m || !y) return 0;
  return parseInt(y) * 10000 + parseInt(m) * 100 + parseInt(d);
}

const COLUMNS: ColumnDef<Encounter>[] = [
  {
    key: 'name',
    header: 'Encontro',
    sortKey: 'name',
    cell: (enc) => (
      <>
        <p className="font-medium text-text">{enc.name}</p>
        {enc.edition_number && <p className="text-xs text-text-muted">{enc.edition_number}ª edição</p>}
      </>
    ),
  },
  {
    key: 'movement',
    header: 'Movimento',
    cell: (enc) => <span className="text-text-muted text-xs">{enc.movement?.name ?? '—'}</span>,
  },
  {
    key: 'date',
    header: 'Data',
    sortKey: 'date',
    cell: (enc) => <span className="text-text-muted text-xs">{enc.date ?? '—'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    cell: (enc) => (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[enc.status]}`}>
        {ENCOUNTER_STATUS_LABELS[enc.status]}
      </span>
    ),
  },
  {
    key: 'actions',
    header: '',
    cell: (enc) => (
      <div className="text-right">
        <Link href={`/app/encounters/${enc.id}`}>
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
      </div>
    ),
  },
];

function getValue(enc: Encounter, sortKey: string): string | number {
  if (sortKey === 'name') return enc.name ?? '';
  if (sortKey === 'date') return parseBRDate(enc.date);
  return '';
}

const EncountersList: SafeFC = () => {
  useTutorial();
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const params = useMemo(() => ({
    per_page: 20,
    page,
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
  }), [page, filterStatus, debouncedSearch]);

  const { data, isLoading: loading, isError } = useEncounterList(params);
  const encounters = data?.data ?? [];
  const meta = data?.meta ?? null;

  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <div className="flex items-center justify-between gap-4" data-tutorial="encounters-header">
        <div>
          <h1 className="text-xl font-bold text-text">Encontros</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading ? 'Carregando...' : `${total} encontro${total !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/app/encounters/new" data-tutorial="encounters-new-btn">
          <Button leftIcon={<Plus size={16} />}>Novo Encontro</Button>
        </Link>
      </div>

      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="encounters-filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            name="search"
            placeholder="Buscar pelo nome..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            startIcon={<Search size={15} />}
          />
          <Select name="filterStatus" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">Todos os status</option>
            <option value="draft">Rascunho</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Concluído</option>
          </Select>
        </div>
      </div>

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="encounters-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando encontros...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar encontros.</div>
        ) : encounters.length === 0 ? (
          <div className="py-20 text-center">
            <CalendarDays size={40} className="mx-auto mb-3 text-text-muted/30" />
            <p className="text-sm font-medium text-text-muted">Nenhum encontro cadastrado</p>
            <Link href="/app/encounters/new">
              <Button variant="ghost" size="sm" className="mt-3" leftIcon={<Plus size={14} />}>Criar encontro</Button>
            </Link>
          </div>
        ) : (
          <>
            <SortableTable
              columns={COLUMNS}
              rows={encounters}
              rowKey={(enc) => enc.id}
              getValue={getValue}
              defaultSortKey="date"
              defaultSortDir="desc"
            />
            {meta && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>
    </div>
  );
};

export default EncountersList;
