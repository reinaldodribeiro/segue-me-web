'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Calendar, CheckCircle2, ChevronRight, Loader2, TrendingUp, Users } from 'lucide-react';
import { EncounterStatus, Encounter } from '@/interfaces/Encounter';
import { EngagementLevel } from '@/interfaces/Person';
import dynamic from 'next/dynamic';
import { useAnalytics } from '@/hooks/useAnalytics';
import ParishFilter from '@/components/ParishFilter';
import TopEngagedList from '@/components/TopEngagedList';
import StatCard from './StatCard';
import { useTutorial } from '@/hooks/useTutorial';
import { useDashboardStats } from '@/lib/query/hooks/useDashboard';
import {
  ENGAGEMENT_CONFIG,
  ENGAGEMENT_LEVELS,
  ENCOUNTER_STATUS_BADGE,
  QUICK_ACTIONS,
} from './constants';

const EngagementChart = dynamic(() => import('./EngagementChart'), {
  ssr: false,
  loading: () => <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>,
});
const ScoreChart = dynamic(() => import('./ScoreChart'), {
  ssr: false,
  loading: () => <Skeleton className="h-44 mx-5 my-4" />,
});

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-hover rounded-xl animate-pulse ${className}`} />;
}

const Dashboard: SafeFC = () => {
  useTutorial();
  const { filter, engagement, loadingEngagement } = useAnalytics();
  const { selectedParishId, isAboveParish, loadingScope } = filter;

  const hasPersonAccess = !isAboveParish || !!selectedParishId;

  const { data: stats, isLoading: loadingStats } = useDashboardStats({
    parishId: selectedParishId ?? undefined,
    isAboveParish,
    hasPersonAccess,
  });

  /* ── Derived ─────────────────────────────────────────────────────── */
  const engagementDist = useMemo(() => {
    if (engagement) {
      return ENGAGEMENT_LEVELS.map((level) => ({
        level,
        count: engagement.by_level[level] ?? 0,
        pct: engagement.total_active > 0
          ? Math.round(((engagement.by_level[level] ?? 0) / engagement.total_active) * 100)
          : 0,
      }));
    }
    const sample = stats?.peopleSample ?? [];
    const total = sample.length || 1;
    return ENGAGEMENT_LEVELS.map((level) => {
      const count = sample.filter((p) => p.engagement_level === level).length;
      return { level, count, pct: Math.round((count / total) * 100) };
    });
  }, [engagement, stats]);

  const topPeople = useMemo(() => {
    if (engagement?.top_20?.length) return engagement.top_20.slice(0, 5);
    return [...(stats?.peopleSample ?? [])]
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, engagement_score: p.engagement_score, engagement_level: p.engagement_level as string }));
  }, [engagement, stats]);

  const recentEncounters: Encounter[] = useMemo(
    () => (stats?.recentEncounters ?? []).slice(0, 5),
    [stats],
  );

  const encountersByStatus = useMemo(() => ({
    draft:     (stats?.recentEncounters ?? []).filter((e) => e.status === 'draft').length,
    confirmed: (stats?.recentEncounters ?? []).filter((e) => e.status === 'confirmed').length,
    completed: (stats?.recentEncounters ?? []).filter((e) => e.status === 'completed').length,
  }), [stats]);

  const totalPeople = engagement?.total_active ?? stats?.totalPeople ?? 0;
  const avgScore    = engagement ? Math.round(engagement.average_score) : (stats?.avgScore ?? 0);

  const loading = loadingStats;

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      <div>
        <h1 className="text-xl font-bold text-text">Dashboard</h1>
        <p className="text-xs text-text-muted mt-0.5">Visão geral da sua paróquia</p>
      </div>

      {isAboveParish && <div data-tutorial="dashboard-parish-filter"><ParishFilter {...filter} /></div>}


      {/* Loading scope (enumerating diocese parishes) */}
      {loadingScope && (
        <div className="flex items-center gap-2 text-xs text-text-muted px-1">
          <Loader2 size={13} className="animate-spin" />
          Carregando paróquias do escopo…
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tutorial="dashboard-kpi-cards">
          <StatCard icon={<Users size={18} className="text-primary" />} label="Total de Pessoas" value={totalPeople} iconBg="bg-primary/10" />
          <StatCard icon={<TrendingUp size={18} className="text-violet-600" />} label="Score Médio" value={avgScore} iconBg="bg-violet-100" sub="de engajamento" />
          <StatCard icon={<Calendar size={18} className="text-blue-600" />} label="Total de Encontros" value={stats?.totalEncounters ?? 0} iconBg="bg-blue-100" />
          <StatCard icon={<CheckCircle2 size={18} className="text-green-600" />} label="Confirmados" value={encountersByStatus.confirmed} iconBg="bg-green-100" sub="encontros ativos" />
        </div>
      )}

      {/* Charts row */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Score histogram */}
          <div className="lg:col-span-2 bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="dashboard-score-chart">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Distribuição de Scores</h2>
              <p className="text-xs text-text-muted mt-0.5">Quantidade de pessoas por faixa de engajamento</p>
            </div>
            {(
              <>
                <div className="px-5 pt-4 pb-3">
                  <ScoreChart people={stats?.peopleSample ?? []} />
                </div>
                <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                  {[
                    { label: 'Score 81–100', color: 'text-amber-500',  count: (stats?.peopleSample ?? []).filter(p => p.engagement_score >= 81).length },
                    { label: 'Score 41–80',  color: 'text-violet-500', count: (stats?.peopleSample ?? []).filter(p => p.engagement_score >= 41 && p.engagement_score <= 80).length },
                    { label: 'Score 0–40',   color: 'text-slate-400',  count: (stats?.peopleSample ?? []).filter(p => p.engagement_score <= 40).length },
                  ].map(({ label, color, count }) => (
                    <div key={label} className="px-4 py-2.5 text-center">
                      <p className="text-base font-bold text-text">{count}</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${color}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Engagement donut */}
          <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="dashboard-engagement-chart">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Nível de Engajamento</h2>
              <p className="text-xs text-text-muted mt-0.5">Proporção por categoria</p>
            </div>
            {loadingEngagement ? (
              <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
            ) : (
              <>
                <div className="px-2 pt-3">
                  <EngagementChart data={engagementDist} />
                </div>
                <div className="px-5 pb-4 space-y-1.5">
                  {engagementDist.map(({ level, count }) => {
                    const cfg = ENGAGEMENT_CONFIG[level as EngagementLevel];
                    return (
                      <div key={level} className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
                        <span className="text-xs text-text-muted tabular-nums">{count.toLocaleString('pt-BR')} pessoas</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Encounters + Top people */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Skeleton className="lg:col-span-2 h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent encounters */}
          <div className="lg:col-span-2 bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="dashboard-recent-encounters">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-text">Encontros Recentes</h2>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px] text-slate-500">{encountersByStatus.draft} rascunho</span>
                  <span className="text-[10px] text-green-600">{encountersByStatus.confirmed} confirmado</span>
                  <span className="text-[10px] text-primary">{encountersByStatus.completed} concluído</span>
                </div>
              </div>
              <Link href="/app/encounters" className="text-xs text-primary hover:underline shrink-0">Ver todos →</Link>
            </div>
            {recentEncounters.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-10">Nenhum encontro cadastrado.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentEncounters.map((enc) => (
                  <Link key={enc.id} href={`/app/encounters/${enc.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-hover transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate group-hover:text-primary transition-colors">
                        {enc.name}{enc.edition_number ? ` · ${enc.edition_number}ª ed.` : ''}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {enc.movement?.name ?? '—'}{enc.date ? ` · ${enc.date}` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ENCOUNTER_STATUS_BADGE[enc.status as EncounterStatus]}`}>
                      {enc.status_label}
                    </span>
                    <ChevronRight size={14} className="text-text-muted/40 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top people */}
          <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="dashboard-top-people">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Mais Engajados</h2>
            </div>
            <TopEngagedList
              people={topPeople}
              loading={loadingEngagement}
              showGauge
              avgScore={avgScore}
              viewAllHref="/app/people"
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Ações Rápidas</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tutorial="dashboard-quick-actions">
          {QUICK_ACTIONS.map(({ label, href, Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2.5 px-4 py-3 bg-panel border border-border rounded-xl hover:bg-hover hover:border-primary/30 transition-colors text-sm font-medium text-text group">
              <Icon size={16} className="text-text-muted group-hover:text-primary transition-colors shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
