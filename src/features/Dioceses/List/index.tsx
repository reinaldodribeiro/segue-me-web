'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Landmark, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useDioceseList } from '@/lib/query/hooks/useDioceses';
import { useTutorial } from '@/hooks/useTutorial';

const DiocesesList: React.FC = () => {
  useTutorial();
  const [search, setSearch] = useState('');

  const { data, isLoading: loading, isError } = useDioceseList();
  const dioceses = data?.data ?? [];

  const filtered = dioceses.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4" data-tutorial="dioceses-header">
        <div>
          <h1 className="text-xl font-bold text-text">Dioceses</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {dioceses.length} {dioceses.length === 1 ? 'diocese cadastrada' : 'dioceses cadastradas'}
          </p>
        </div>
        <Link href="/app/dioceses/new" data-tutorial="dioceses-new-btn">
          <Button leftIcon={<Plus size={16} />}>Nova Diocese</Button>
        </Link>
      </div>

      <Input
        name="search"
        placeholder="Buscar diocese..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        startIcon={<Search size={16} />}
      />

      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="dioceses-table">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-text-muted">
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar dioceses.</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Landmark size={36} className="mx-auto mb-3 text-text-muted/40" />
            <p className="text-sm text-text-muted">
              {search ? 'Nenhuma diocese encontrada para esta busca.' : 'Nenhuma diocese cadastrada.'}
            </p>
            {!search && (
              <Link href="/app/dioceses/new">
                <Button variant="ghost" size="sm" className="mt-3" leftIcon={<Plus size={14} />}>
                  Criar diocese
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-hover/30">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-text-muted">Nome</th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted">Slug</th>
                <th className="px-4 py-3 text-left font-semibold text-text-muted">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((diocese) => (
                <tr key={diocese.id} className="hover:bg-hover/40 transition-colors">
                  <td className="px-4 py-3 font-medium text-text">{diocese.name}</td>
                  <td className="px-4 py-3 text-text-muted font-mono text-xs">{diocese.slug}</td>
                  <td className="px-4 py-3">
                    {diocese.active ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
                        <CheckCircle2 size={14} /> Ativa
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
                        <XCircle size={14} /> Inativa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/app/dioceses/${diocese.id}`}>
                      <Button variant="ghost" size="sm">Editar</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DiocesesList;
