'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Download, Loader2, Star, TrendingUp, Users, Calendar } from 'lucide-react';
import PersonService from '@/services/api/PersonService';
import { useAnalytics } from '@/context/AnalyticsContext';
import { useEncounterList } from '@/lib/query/hooks/useEncounters';
import ParishFilter from '@/components/ParishFilter';
import EncounterDetail from './EncounterDetail';
import { ENGAGEMENT_LEVEL_CONFIG, ENGAGEMENT_LEVELS_ORDER } from './constants';
import { useTutorial } from '@/hooks/useTutorial';

const ReportsChartsBundle = dynamic(() => import('./ReportsChartsBundle'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className={`bg-hover rounded-xl animate-pulse h-64 ${i === 1 ? 'lg:col-span-2' : ''}`} />
      ))}
    </div>
  ),
});

/* ─── constants ─────────────────────────────────────────────────── */

const STATUS_COLORS  = { draft: '#cbd5e1', confirmed: '#4ade80', completed: '#7c3aed' };
const STATUS_LABELS  = { draft: 'Rascunho', confirmed: 'Confirmado', completed: 'Concluído' };

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-hover rounded-xl animate-pulse ${className}`} />;
}

function StatCard({ icon, label, value, sub, iconBg }: {
  icon: React.ReactNode; label: string; value: React.ReactNode; sub?: string; iconBg: string;
}) {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 flex items-start gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-text-muted/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────── */

const Reports: React.FC = () => {
  useTutorial();
  const { filter, engagement, loadingEngagement } = useAnalytics();
  const { selectedParishId, selectedParishName, loadingScope, isAboveParish } = filter;

  const [exportingExcel, setExportingExcel] = useState(false);

  /* ── encounters: scope by parish when selected ───────────────────── */
  const encounterParams = useMemo<Record<string, unknown>>(() => {
    const params: Record<string, unknown> = { per_page: 100 };
    if (isAboveParish && selectedParishId) params.parish_id = selectedParishId;
    return params;
  }, [isAboveParish, selectedParishId]);

  const { data: encounterData, isLoading: loadingEncounters } = useEncounterList(encounterParams);
  const encounters = encounterData?.data ?? [];

  /* ── derived data ─────────────────────────────────────────────────── */
  const donutData = useMemo(() =>
    ENGAGEMENT_LEVELS_ORDER
      .map((l) => ({ name: ENGAGEMENT_LEVEL_CONFIG[l].label, value: engagement?.by_level[l] ?? 0, level: l }))
      .filter((d) => d.value > 0),
    [engagement]
  );

  const encounterStatusData = useMemo(() =>
    (['draft', 'confirmed', 'completed'] as const).map((s) => ({
      name: STATUS_LABELS[s],
      value: encounters.filter((e) => e.status === s).length,
      color: STATUS_COLORS[s],
    })),
    [encounters]
  );

  /* ── render ──────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between" data-tutorial="reports-header">
        <div>
          <h1 className="text-xl font-bold text-text">Relatórios</h1>
          <p className="text-xs text-text-muted mt-0.5">
            {selectedParishName ? `Paróquia: ${selectedParishName}` : 'Visão analítica da paróquia e dos encontros'}
          </p>
        </div>
        <div data-tutorial="reports-export">
          {selectedParishId && (
            <button
              onClick={async () => {
                setExportingExcel(true);
                try {
                  const res = await PersonService.exportExcel({ parish_id: selectedParishId });
                  const url = URL.createObjectURL(new Blob([res.data]));
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `pessoas-${new Date().toISOString().slice(0, 10)}.xlsx`;
                  a.click();
                  URL.revokeObjectURL(url);
                } catch {
                  // silently fail
                } finally {
                  setExportingExcel(false);
                }
              }}
              disabled={exportingExcel}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-panel border border-border hover:bg-hover transition-colors text-text disabled:opacity-50"
            >
              {exportingExcel ? <Loader2 size={13} className="animate-spin text-text-muted" /> : <Download size={13} className="text-text-muted" />}
              Exportar Excel
            </button>
          )}
        </div>
      </div>

      {/* Parish filter (admins only) */}
      {isAboveParish && <div data-tutorial="reports-parish-filter"><ParishFilter {...filter} /></div>}

      {loadingScope && (
        <div className="flex items-center gap-2 text-xs text-text-muted px-1">
          <Loader2 size={13} className="animate-spin" />
          Carregando paróquias do escopo…
        </div>
      )}

      {/* KPI row */}
      {loadingEncounters || loadingEngagement ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users size={18} className="text-primary" />}
            label="Total de Pessoas" iconBg="bg-primary/10"
            value={(engagement?.total_active ?? 0).toLocaleString('pt-BR')}
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-violet-600" />}
            label="Score Médio" iconBg="bg-violet-100"
            value={Math.round(engagement?.average_score ?? 0)}
            sub="de engajamento"
          />
          <StatCard
            icon={<Star size={18} className="text-amber-500" />}
            label="Em Destaque" iconBg="bg-amber-100"
            value={(engagement?.by_level['destaque'] ?? 0).toLocaleString('pt-BR')}
            sub="pessoas"
          />
          <StatCard
            icon={<Calendar size={18} className="text-blue-600" />}
            label="Total de Encontros" iconBg="bg-blue-100"
            value={encounters.length.toLocaleString('pt-BR')}
          />
        </div>
      )}

      {/* Charts row — loaded dynamically to keep Recharts out of the initial bundle */}
      <ReportsChartsBundle
        engagement={engagement}
        loadingEngagement={loadingEngagement}
        donutData={donutData}
        encounterStatusData={encounterStatusData}
        loadingEncounters={loadingEncounters}
        encounterCount={encounters.length}
        selectedParishName={selectedParishName}
      />

      {/* Per-encounter detail */}
      {loadingEncounters ? (
        <Skeleton className="h-48" />
      ) : (
        <div data-tutorial="reports-encounter-detail">
          <EncounterDetail encounters={encounters} />
        </div>
      )}

    </div>
  );
};

export default Reports;
