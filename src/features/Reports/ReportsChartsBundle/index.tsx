'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar,
} from 'recharts';
import TopEngagedList from '@/components/TopEngagedList';
import type { EngagementReportData } from '../types';
import { ENGAGEMENT_LEVEL_CONFIG, ENGAGEMENT_LEVELS_ORDER } from '../constants';

const DONUT_COLORS: Record<string, string> = {
  baixo: '#94a3b8', medio: '#60a5fa', alto: '#8b5cf6', destaque: '#f59e0b',
};

function Skeleton({ className }: { className: string }) {
  return <div className={`bg-hover rounded-xl animate-pulse ${className}`} />;
}

interface Props {
  engagement: EngagementReportData | null;
  loadingEngagement: boolean;
  donutData: { name: string; value: number; level: string }[];
  encounterStatusData: { name: string; value: number; color: string }[];
  loadingEncounters: boolean;
  encounterCount: number;
  selectedParishName: string | null;
}

const ReportsChartsBundle: React.FC<Props> = ({
  engagement,
  loadingEngagement,
  donutData,
  encounterStatusData,
  loadingEncounters,
  encounterCount,
  selectedParishName,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Engagement donut + level bars */}
      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="reports-engagement-chart">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Engajamento por Nível</h2>
          <p className="text-xs text-text-muted mt-0.5">Proporção de pessoas por categoria</p>
        </div>

        {loadingEngagement ? (
          <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8" />)}</div>
        ) : !engagement ? (
          <p className="text-xs text-text-muted text-center py-10">Dados não disponíveis.</p>
        ) : (
          <>
            <div className="px-2 pt-3">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData} cx="50%" cy="50%"
                    innerRadius={52} outerRadius={80}
                    paddingAngle={3} dataKey="value" labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx?: number; cy?: number; midAngle?: number; innerRadius?: number; outerRadius?: number; percent?: number }) => {
                      if (percent == null || percent < 0.06) return null;
                      if (cx == null || cy == null || midAngle == null || innerRadius == null || outerRadius == null) return null;
                      const R = Math.PI / 180;
                      const r = innerRadius + (outerRadius - innerRadius) * 0.55;
                      const x = cx + r * Math.cos(-midAngle * R);
                      const y = cy + r * Math.sin(-midAngle * R);
                      return (
                        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
                          {`${Math.round(percent * 100)}%`}
                        </text>
                      );
                    }}
                  >
                    {donutData.map((d) => <Cell key={d.level} fill={DONUT_COLORS[d.level] ?? '#94a3b8'} stroke="transparent" />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                    formatter={(v, n) => [v, n]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v) => <span style={{ color: '#6b7280' }}>{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="px-5 pb-4 space-y-2.5">
              {ENGAGEMENT_LEVELS_ORDER.map((level) => {
                const cfg = ENGAGEMENT_LEVEL_CONFIG[level];
                const count = engagement.by_level[level] ?? 0;
                const pct = engagement.total_active > 0 ? Math.round((count / engagement.total_active) * 100) : 0;
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
                      <span className="text-xs text-text-muted tabular-nums">{count.toLocaleString('pt-BR')} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${cfg.barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Right column: score gauge + top people + encounter status */}
      <div className="lg:col-span-2 space-y-5">

        {/* Score gauge + top engaged */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Radial score gauge */}
          <div className="bg-panel border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Score Médio</h2>
              <p className="text-xs text-text-muted mt-0.5">Engajamento médio da paróquia</p>
            </div>
            <div className="flex flex-col items-center justify-center py-4">
              {loadingEngagement ? (
                <Skeleton className="w-36 h-36 rounded-full" />
              ) : (
                <>
                  <div className="relative">
                    <ResponsiveContainer width={140} height={140}>
                      <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius={45} outerRadius={65}
                        startAngle={210} endAngle={-30}
                        data={[{ value: Math.round(engagement?.average_score ?? 0), fill: '#7c3aed' }]}
                        barSize={14}
                      >
                        <RadialBar dataKey="value" cornerRadius={8} background={{ fill: '#f3f4f6' }} />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-text">{Math.round(engagement?.average_score ?? 0)}</span>
                      <span className="text-[10px] text-text-muted">de 100</span>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1">
                    {ENGAGEMENT_LEVELS_ORDER.map((l) => (
                      <div key={l} className="text-center">
                        <div className="w-2 h-2 rounded-full mx-auto mb-0.5" style={{ backgroundColor: DONUT_COLORS[l] }} />
                        <span className="text-[9px] text-text-muted">{ENGAGEMENT_LEVEL_CONFIG[l].label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top engaged */}
          <div className="bg-panel border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Mais Engajados</h2>
              <p className="text-xs text-text-muted mt-0.5">Top 5 da paróquia</p>
            </div>
            <TopEngagedList
              people={engagement?.top_20 ?? []}
              loading={loadingEngagement}
              limit={5}
            />
          </div>
        </div>

        {/* Encounter status chart */}
        <div className="bg-panel border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-sm font-semibold text-text">
              Encontros por Status
              {selectedParishName && <span className="text-text-muted font-normal text-xs ml-2">— {selectedParishName}</span>}
            </h2>
            <p className="text-xs text-text-muted mt-0.5">Rascunho · Confirmado · Concluído</p>
          </div>
          {loadingEncounters ? (
            <div className="p-5"><Skeleton className="h-28" /></div>
          ) : encounterCount === 0 ? (
            <p className="text-xs text-text-muted text-center py-8">Nenhum encontro cadastrado.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
                {encounterStatusData.map(({ name, value, color }) => (
                  <div key={name} className="px-5 py-3 text-center">
                    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{name}</p>
                  </div>
                ))}
              </div>
              <div className="px-5 pt-4 pb-3">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={encounterStatusData} barSize={48} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                      formatter={(v, n) => [v, n]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {encounterStatusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsChartsBundle;
