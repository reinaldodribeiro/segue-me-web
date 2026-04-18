'use client';

import { useState } from 'react';
import { FileText, Loader2, Brain, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import EncounterService from '@/services/api/EncounterService';
import { slugify } from '@/utils/helpers';
import EvaluationService from '@/services/api/EvaluationService';
import { EncounterAnalysis, FULFILLED_LABELS, RECOMMEND_LABELS } from '@/interfaces/Evaluation';

import type { EncounterReportsProps, RefusalItem } from './types';

const EncounterReports: React.FC<EncounterReportsProps> = ({ encounters }) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [analysis, setAnalysis] = useState<EncounterAnalysis | null>(null);
  const [refusals, setRefusals] = useState<RefusalItem[] | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingRefusals, setLoadingRefusals] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showRefusals, setShowRefusals] = useState(false);

  const selected = encounters.find((e) => e.id === selectedId) ?? null;

  async function fetchAnalysis() {
    if (!selectedId) return;
    setLoadingAnalysis(true);
    setShowAnalysis(true);
    try {
      const res = await EvaluationService.getAnalysis(selectedId);
      setAnalysis(res.data.data);
    } catch {
      setAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  }

  async function fetchRefusals() {
    if (!selectedId) return;
    setLoadingRefusals(true);
    setShowRefusals(true);
    try {
      const res = await EncounterService.reportRefusals(selectedId);
      const byTeam = (res.data?.data as { by_team?: { team: string; refusals: { person_name: string; reason: string | null }[] }[] })?.by_team ?? [];
      const flat: RefusalItem[] = byTeam.flatMap((group) =>
        group.refusals.map((r) => ({
          person_name: r.person_name,
          team_name: group.team,
          refusal_reason: r.reason,
        }))
      );
      setRefusals(flat);
    } catch {
      setRefusals([]);
    } finally {
      setLoadingRefusals(false);
    }
  }

  function handleSelectChange(id: string) {
    setSelectedId(id);
    setAnalysis(null);
    setRefusals(null);
    setShowAnalysis(false);
    setShowRefusals(false);
  }

  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-text">Relatórios de Encontros</h2>
        <p className="text-xs text-text-muted mt-0.5">Análise gerada por IA e lista de recusas por encontro</p>
      </div>

      <div className="p-5 space-y-4">
        {/* Encounter selector */}
        <div>
          <label className="text-xs font-medium text-text-muted block mb-1.5">Selecionar encontro</label>
          <select
            value={selectedId}
            onChange={(e) => handleSelectChange(e.target.value)}
            className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">— Escolha um encontro —</option>
            {encounters.map((enc) => (
              <option key={enc.id} value={enc.id}>
                {enc.name}{enc.edition_number ? ` · ${enc.edition_number}ª ed.` : ''}{enc.date ? ` · ${enc.date}` : ''}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="flex flex-wrap gap-2">
            {/* PDF */}
            <button
              onClick={() => EncounterService.downloadPdf(selected.id, `encontro-${slugify(selected.name)}.pdf`)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <FileText size={13} />
              Baixar PDF
            </button>

            {/* Analysis */}
            <button
              onClick={fetchAnalysis}
              disabled={loadingAnalysis}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors disabled:opacity-50"
            >
              {loadingAnalysis ? <Loader2 size={13} className="animate-spin" /> : <Brain size={13} />}
              {analysis ? 'Recarregar Análise' : 'Ver Análise IA'}
            </button>

            {/* Refusals */}
            <button
              onClick={fetchRefusals}
              disabled={loadingRefusals}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors disabled:opacity-50"
            >
              {loadingRefusals ? <Loader2 size={13} className="animate-spin" /> : <AlertTriangle size={13} />}
              {refusals ? 'Recarregar Recusas' : 'Ver Recusas'}
            </button>
          </div>
        )}

        {/* Analysis result */}
        {showAnalysis && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAnalysis((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-hover text-sm font-medium text-text"
            >
              <span>Análise do Encontro</span>
              {showAnalysis ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <div className="px-4 py-3">
              {loadingAnalysis ? (
                <div className="flex items-center gap-2 text-xs text-text-muted py-4">
                  <Loader2 size={14} className="animate-spin" />
                  Carregando análise…
                </div>
              ) : analysis?.status === 'generating' ? (
                <div className="flex items-center gap-2 text-xs text-text-muted py-4">
                  <Loader2 size={14} className="animate-spin" />
                  Análise sendo gerada, tente novamente em instantes…
                </div>
              ) : analysis?.general_analysis ? (
                <div className="space-y-5">
                  {/* Análise geral gerada pela IA */}
                  <div>
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Análise Geral (IA)</p>
                    <p className="text-sm text-text whitespace-pre-line leading-relaxed">{analysis.general_analysis}</p>
                  </div>

                  {/* Avaliações por equipe (dados reais) */}
                  {analysis.team_evaluations.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Avaliações por Equipe</p>
                      {analysis.team_evaluations.map((te) => (
                        <div key={te.team_id} className="border border-border rounded-lg overflow-hidden">
                          {/* Header com nome e nota geral */}
                          <div className="px-4 py-2.5 bg-hover flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-text">{te.team_name}</p>
                            <div className="flex items-center gap-3 text-xs text-text-muted">
                              <span>Prep: <strong className="text-text">{te.preparation_rating}/5</strong></span>
                              <span>Equipe: <strong className="text-text">{te.teamwork_rating}/5</strong></span>
                              <span>Materiais: <strong className="text-text">{te.materials_rating}/5</strong></span>
                              <span className="text-primary font-semibold">Geral: {te.overall_team_rating}/5</span>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            {/* Comentários */}
                            {(te.preparation_comment || te.teamwork_comment || te.materials_comment || te.issues_text || te.improvements_text) && (
                              <div className="space-y-1 text-xs">
                                {te.preparation_comment && <p><span className="text-text-muted">Preparação:</span> {te.preparation_comment}</p>}
                                {te.teamwork_comment && <p><span className="text-text-muted">Trabalho em equipe:</span> {te.teamwork_comment}</p>}
                                {te.materials_comment && <p><span className="text-text-muted">Materiais:</span> {te.materials_comment}</p>}
                                {te.issues_text && <p><span className="text-red-500 font-medium">Problemas:</span> {te.issues_text}</p>}
                                {te.improvements_text && <p><span className="text-blue-500 font-medium">Melhorias:</span> {te.improvements_text}</p>}
                              </div>
                            )}

                            {/* Tabela de membros */}
                            {te.members.length > 0 && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="border-b border-border">
                                      <th className="text-left py-1.5 pr-3 text-text-muted font-medium">Membro</th>
                                      <th className="text-center py-1.5 px-2 text-text-muted font-medium whitespace-nowrap">Comp.</th>
                                      <th className="text-center py-1.5 px-2 text-text-muted font-medium whitespace-nowrap">Resp.</th>
                                      <th className="text-center py-1.5 px-2 text-text-muted font-medium whitespace-nowrap">Rec.</th>
                                      <th className="text-left py-1.5 pl-3 text-text-muted font-medium">Destaque / Problema</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-border/50">
                                    {te.members.map((m, i) => (
                                      <tr key={i}>
                                        <td className="py-1.5 pr-3 font-medium text-text">{m.name}</td>
                                        <td className="py-1.5 px-2 text-center">{m.commitment_rating}/5</td>
                                        <td className="py-1.5 px-2 text-center">
                                          <span className={
                                            m.fulfilled_responsibilities === 'yes' ? 'text-green-600' :
                                            m.fulfilled_responsibilities === 'partially' ? 'text-amber-600' : 'text-red-500'
                                          }>
                                            {FULFILLED_LABELS[m.fulfilled_responsibilities]}
                                          </span>
                                        </td>
                                        <td className="py-1.5 px-2 text-center">
                                          <span className={
                                            m.recommend === 'yes' ? 'text-green-600' :
                                            m.recommend === 'with_reservations' ? 'text-amber-600' : 'text-red-500'
                                          }>
                                            {RECOMMEND_LABELS[m.recommend]}
                                          </span>
                                        </td>
                                        <td className="py-1.5 pl-3 text-text-muted">
                                          {m.positive_highlight && <span className="text-green-700">{m.positive_highlight}</span>}
                                          {m.positive_highlight && m.issue_observed && <span className="mx-1">·</span>}
                                          {m.issue_observed && <span className="text-red-600">{m.issue_observed}</span>}
                                          {!m.positive_highlight && !m.issue_observed && '—'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-muted py-4 text-center">Análise não disponível para este encontro.</p>
              )}
            </div>
          </div>
        )}

        {/* Refusals result */}
        {showRefusals && refusals !== null && (
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowRefusals((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-hover text-sm font-medium text-text"
            >
              <span>Recusas ({refusals.length})</span>
              {showRefusals ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {refusals.length === 0 ? (
              <p className="text-xs text-text-muted px-4 py-4 text-center">Nenhuma recusa registrada.</p>
            ) : (
              <div className="divide-y divide-border">
                {refusals.map((r, i) => (
                  <div key={i} className="px-4 py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text truncate">{r.person_name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{r.team_name}</p>
                    </div>
                    {r.refusal_reason && (
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded shrink-0 max-w-[200px] text-right">
                        {r.refusal_reason}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EncounterReports;
