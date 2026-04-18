'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  AlertTriangle, CheckCircle2, FileText, Loader2, Brain,
  Users, XCircle, Clock,
} from 'lucide-react';
import EncounterService from '@/services/api/EncounterService';
import EvaluationService from '@/services/api/EvaluationService';
import { slugify } from '@/utils/helpers';
import type { EncounterDetailProps, RefusalItem, DetailState } from './types';

const EMPTY_STATE: DetailState = {
  summary: null, analysis: null, refusals: null,
  loadingSummary: false, loadingAnalysis: false, loadingRefusals: false,
};

const EncounterDetail: React.FC<EncounterDetailProps> = ({ encounters }) => {
  const [selectedId, setSelectedId] = useState('');
  const [state, setState] = useState<DetailState>(EMPTY_STATE);
  const [activeTab, setActiveTab] = useState<'summary' | 'analysis' | 'refusals'>('summary');

  const selected = encounters.find((e) => e.id === selectedId) ?? null;

  function update(patch: Partial<DetailState>) {
    setState((s) => ({ ...s, ...patch }));
  }

  async function handleSelect(id: string) {
    setSelectedId(id);
    setState({ ...EMPTY_STATE, loadingSummary: true });
    setActiveTab('summary');
    if (!id) return;
    try {
      const res = await EncounterService.summary(id);
      update({ summary: res.data.data, loadingSummary: false });
    } catch {
      update({ loadingSummary: false });
    }
  }

  async function fetchAnalysis() {
    if (!selectedId) return;
    update({ loadingAnalysis: true });
    setActiveTab('analysis');
    try {
      const res = await EvaluationService.getAnalysis(selectedId);
      update({ analysis: res.data.data, loadingAnalysis: false });
    } catch {
      update({ analysis: null, loadingAnalysis: false });
    }
  }

  async function fetchRefusals() {
    if (!selectedId) return;
    update({ loadingRefusals: true });
    setActiveTab('refusals');
    try {
      const res = await EncounterService.reportRefusals(selectedId);
      const byTeam = (res.data?.data as { by_team?: { team: string; refusals: { person_name: string; reason: string | null }[] }[] })?.by_team ?? [];
      const flat: RefusalItem[] = byTeam.flatMap((g) =>
        g.refusals.map((r) => ({ person_name: r.person_name, team_name: g.team, refusal_reason: r.reason }))
      );
      update({ refusals: flat, loadingRefusals: false });
    } catch {
      update({ refusals: [], loadingRefusals: false });
    }
  }

  // Build team chart data from summary
  const teamChartData = (state.summary?.teams ?? []).map((t) => ({
    name: t.name.length > 12 ? t.name.slice(0, 12) + '…' : t.name,
    Confirmados: t.confirmed,
    Pendentes: t.pending,
    Recusas: t.refused,
  }));

  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text">Relatório por Encontro</h2>
        <p className="text-xs text-text-muted mt-0.5">Resumo de equipes, análise IA e lista de recusas</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Selector */}
        <select
          value={selectedId}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">— Selecione um encontro —</option>
          {encounters.map((enc) => (
            <option key={enc.id} value={enc.id}>
              {enc.name}{enc.edition_number ? ` · ${enc.edition_number}ª ed.` : ''}{enc.date ? ` · ${enc.date}` : ''} — {enc.status_label}
            </option>
          ))}
        </select>

        {!selected && (
          <p className="text-xs text-text-muted text-center py-4">Selecione um encontro para ver o relatório.</p>
        )}

        {selected && (
          <>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${activeTab === 'summary' ? 'bg-primary text-white' : 'bg-hover text-text hover:bg-border'}`}
              >
                <Users size={13} />
                Resumo de Equipes
              </button>
              <button
                onClick={fetchAnalysis}
                disabled={state.loadingAnalysis}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${activeTab === 'analysis' ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-700 hover:bg-violet-200'}`}
              >
                {state.loadingAnalysis ? <Loader2 size={13} className="animate-spin" /> : <Brain size={13} />}
                Análise IA
              </button>
              <button
                onClick={fetchRefusals}
                disabled={state.loadingRefusals}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${activeTab === 'refusals' ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}
              >
                {state.loadingRefusals ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
                Recusas
              </button>
              <button
                onClick={() => EncounterService.downloadPdf(selected.id, `encontro-${slugify(selected.name)}.pdf`)}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors ml-auto"
              >
                <FileText size={13} />
                Baixar PDF
              </button>
            </div>

            {/* Tab: Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {state.loadingSummary ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-hover rounded-xl animate-pulse" />)}
                    </div>
                    <div className="h-48 bg-hover rounded-xl animate-pulse" />
                  </div>
                ) : state.summary ? (
                  <>
                    {/* KPI mini-cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-hover rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-text">{state.summary.total_filled}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Alocados</p>
                        <p className="text-[10px] text-text-muted/60">de {state.summary.total_slots} vagas</p>
                      </div>
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                        <CheckCircle2 size={14} className="text-green-600 mx-auto mb-1" />
                        <p className="text-xl font-bold text-green-700">{state.summary.total_confirmed}</p>
                        <p className="text-[10px] text-green-600 mt-0.5">Confirmados</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                        <Clock size={14} className="text-amber-600 mx-auto mb-1" />
                        <p className="text-xl font-bold text-amber-700">{state.summary.total_pending}</p>
                        <p className="text-[10px] text-amber-600 mt-0.5">Pendentes</p>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                        <XCircle size={14} className="text-red-500 mx-auto mb-1" />
                        <p className="text-xl font-bold text-red-600">{state.summary.total_refused}</p>
                        <p className="text-[10px] text-red-500 mt-0.5">Recusas</p>
                      </div>
                    </div>

                    {/* Team breakdown chart */}
                    {teamChartData.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-text-muted mb-3">Confirmados · Pendentes · Recusas por equipe</p>
                        <ResponsiveContainer width="100%" height={Math.max(180, teamChartData.length * 36)}>
                          <BarChart
                            layout="vertical"
                            data={teamChartData}
                            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                            barSize={10}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={80} />
                            <Tooltip
                              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,.08)' }}
                              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                            />
                            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            <Bar dataKey="Confirmados" fill="#4ade80" radius={[0, 3, 3, 0]} />
                            <Bar dataKey="Pendentes"   fill="#fbbf24" radius={[0, 3, 3, 0]} />
                            <Bar dataKey="Recusas"     fill="#f87171" radius={[0, 3, 3, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Team list */}
                    <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
                      {state.summary.teams.map((team) => {
                        const fillPct = team.max_members > 0 ? Math.round((team.total / team.max_members) * 100) : 0;
                        return (
                          <div key={team.id} className="px-4 py-3 flex items-center gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-xs font-medium text-text truncate">{team.name}</p>
                                {team.is_full && (
                                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium shrink-0">Completa</span>
                                )}
                                {team.is_below_minimum && !team.is_full && (
                                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">Incompleta</span>
                                )}
                              </div>
                              <div className="h-1.5 bg-hover rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${team.is_full ? 'bg-green-400' : team.is_below_minimum ? 'bg-amber-400' : 'bg-primary/60'}`}
                                  style={{ width: `${Math.min(100, fillPct)}%` }}
                                />
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-xs font-bold text-text">{team.total}/{team.max_members}</p>
                              <p className="text-[10px] text-text-muted">{team.confirmed} conf.</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-text-muted text-center py-6">Resumo não disponível.</p>
                )}
              </div>
            )}

            {/* Tab: Analysis */}
            {activeTab === 'analysis' && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-violet-50 border-b border-violet-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  <span className="text-xs font-medium text-violet-700">Análise gerada por IA</span>
                </div>
                <div className="p-4">
                  {state.loadingAnalysis ? (
                    <div className="flex items-center gap-2 text-xs text-text-muted py-6 justify-center">
                      <Loader2 size={14} className="animate-spin" />
                      Carregando análise…
                    </div>
                  ) : state.analysis?.status === 'generating' ? (
                    <div className="flex items-center gap-2 text-xs text-violet-600 py-6 justify-center">
                      <Loader2 size={14} className="animate-spin" />
                      Análise sendo gerada, tente novamente em instantes…
                    </div>
                  ) : state.analysis?.general_analysis ? (
                    <div className="space-y-4">
                      <p className="text-sm text-text whitespace-pre-line leading-relaxed">{state.analysis.general_analysis}</p>
                      {state.analysis.team_analyses.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-text-muted">Por equipe:</p>
                          {state.analysis.team_analyses.map((ta) => (
                            <div key={ta.team_id} className="border border-border rounded-lg p-3">
                              <p className="text-xs font-semibold text-primary mb-1">{ta.team_name}</p>
                              <p className="text-sm text-text whitespace-pre-line leading-relaxed">{ta.analysis}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-text-muted text-center py-6">Análise não disponível para este encontro.</p>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Refusals */}
            {activeTab === 'refusals' && (
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-700">Lista de Recusas</span>
                  {state.refusals && (
                    <span className="text-xs text-amber-600">{state.refusals.length} recusa(s)</span>
                  )}
                </div>
                {state.loadingRefusals ? (
                  <div className="flex items-center gap-2 text-xs text-text-muted py-6 justify-center">
                    <Loader2 size={14} className="animate-spin" />
                    Carregando recusas…
                  </div>
                ) : !state.refusals || state.refusals.length === 0 ? (
                  <p className="text-xs text-text-muted text-center py-6">Nenhuma recusa registrada.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {state.refusals.map((r, i) => (
                      <div key={i} className="px-4 py-3 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-text truncate">{r.person_name}</p>
                          <p className="text-xs text-text-muted mt-0.5">{r.team_name}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded shrink-0 max-w-[200px] text-right ${r.refusal_reason ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-text-muted bg-hover'}`}>
                          {r.refusal_reason ?? 'Sem motivo'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EncounterDetail;
