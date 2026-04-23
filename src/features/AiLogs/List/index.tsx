'use client';

import { ReactNode, useState } from 'react';
import { Bot, RefreshCw, DollarSign, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import DateInput from '@/components/DateInput';
import Pagination from '@/components/Pagination';
import { AiApiLog } from '@/interfaces/AiApiLog';
import { useAiApiLogList, useAiApiLogStats } from '@/lib/query/hooks/useAiApiLogs';
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

function formatCost(usd: number): string {
  if (usd === 0) return '$0,000000';
  if (usd < 0.0001) return `$${usd.toFixed(8)}`;
  return `$${usd.toFixed(6)}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const ACTION_LABELS: Record<string, string> = {
  encounter_analysis:    'Análise de Encontro',
  member_suggestion:     'Sugestão de Membros',
  replacement_suggestion:'Sugestão de Substitutos',
  ficha_extraction:      'Extração de Ficha',
  unknown:               'Desconhecido',
};

function actionBadgeClass(action: string): string {
  const map: Record<string, string> = {
    encounter_analysis:     'text-purple-700 bg-purple-50 border-purple-200',
    member_suggestion:      'text-blue-700 bg-blue-50 border-blue-200',
    replacement_suggestion: 'text-amber-700 bg-amber-50 border-amber-200',
    ficha_extraction:       'text-green-700 bg-green-50 border-green-200',
  };
  return map[action] ?? 'text-text-muted bg-hover border-border';
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  sub?: string;
}

function StatCard({ label, value, icon, sub }: StatCardProps) {
  return (
    <div className="bg-panel border border-border rounded-xl p-4 flex items-start gap-3">
      <div className="p-2 rounded-lg bg-hover text-primary">{icon}</div>
      <div>
        <p className="text-xs text-text-muted font-medium">{label}</p>
        <p className="text-lg font-bold text-text">{value}</p>
        {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const AiLogsList: SafeFC = () => {
  useTutorial();
  const [action, setAction] = useState('');
  const [success, setSuccess] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const debouncedAction = useDebounce(action, 400);

  const logParams: Record<string, unknown> = { per_page: 25, page };
  if (debouncedAction) logParams.action = debouncedAction;
  if (success !== '') logParams.success = success === 'true';
  if (from) logParams.from = from;
  if (to) logParams.to = to;

  const statsParams = { ...(from ? { from } : {}), ...(to ? { to } : {}) };

  const { data: logsData, isLoading: loading, isError } = useAiApiLogList(logParams);
  const { data: stats, isLoading: statsLoading } = useAiApiLogStats(statsParams);

  const logs = logsData?.data ?? [];
  const meta = logsData?.meta ?? null;

  function clearFilters() {
    setAction(''); setSuccess(''); setFrom(''); setTo(''); setPage(1);
  }

  const hasFilters = action || success || from || to;
  const total = meta?.total ?? 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Logs de IA</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Monitoramento de uso da API Anthropic Claude
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-tutorial="ai-logs-stats">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-panel border border-border rounded-xl p-4 h-20 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard
              label="Custo Total"
              value={`$${stats.total_cost_usd.toFixed(4)}`}
              icon={<DollarSign size={16} />}
              sub="USD estimado"
            />
            <StatCard
              label="Total de Chamadas"
              value={stats.total_calls}
              icon={<Zap size={16} />}
              sub={`Taxa de sucesso: ${stats.success_rate}%`}
            />
            <StatCard
              label="Total de Tokens"
              value={formatTokens(stats.total_tokens)}
              icon={<Bot size={16} />}
              sub={`↑ ${formatTokens(stats.total_input_tokens)} / ↓ ${formatTokens(stats.total_output_tokens)}`}
            />
            <StatCard
              label="Tempo Médio"
              value={`${Math.round(stats.avg_duration_ms)}ms`}
              icon={<Clock size={16} />}
              sub={`${stats.failed_calls} erro${stats.failed_calls !== 1 ? 's' : ''}`}
            />
          </>
        ) : null}
      </div>

      {/* Breakdown by action */}
      {stats && stats.by_action.length > 0 && (
        <div className="bg-panel border border-border rounded-xl p-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">Por tipo de ação</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.by_action.map((row) => (
              <div key={row.action} className="border border-border rounded-lg p-3 space-y-1">
                <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${actionBadgeClass(row.action)}`}>
                  {ACTION_LABELS[row.action] ?? row.action}
                </span>
                <div className="text-xs text-text-muted space-y-0.5 pt-1">
                  <p><span className="font-medium text-text">{row.calls}</span> chamadas</p>
                  <p><span className="font-medium text-text">{formatTokens(row.tokens)}</span> tokens</p>
                  <p><span className="font-medium text-text">${row.cost_usd.toFixed(4)}</span> USD</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-panel border border-border rounded-xl p-4" data-tutorial="ai-logs-filters">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm bg-panel text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1); }}
          >
            <option value="">Todas as ações</option>
            <option value="encounter_analysis">Análise de Encontro</option>
            <option value="member_suggestion">Sugestão de Membros</option>
            <option value="replacement_suggestion">Sugestão de Substitutos</option>
            <option value="ficha_extraction">Extração de Ficha</option>
          </select>
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm bg-panel text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={success}
            onChange={(e) => { setSuccess(e.target.value); setPage(1); }}
          >
            <option value="">Todos os status</option>
            <option value="true">Sucesso</option>
            <option value="false">Erro</option>
          </select>
          <DateInput name="from" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
          <DateInput name="to" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
        </div>
        {hasFilters && (
          <div className="mt-3">
            <button onClick={clearFilters} className="text-xs text-primary hover:underline">
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-panel border border-border rounded-xl overflow-hidden" data-tutorial="ai-logs-table">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm text-text-muted">
            {loading ? 'Carregando...' : `${total} registro${total !== 1 ? 's' : ''}`}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-text-muted">
            <RefreshCw size={20} className="animate-spin" />
            <span className="text-sm">Carregando registros...</span>
          </div>
        ) : isError ? (
          <div className="py-16 text-center text-sm text-red-500">Erro ao carregar logs de IA.</div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center">
            <Bot size={40} className="mx-auto mb-3 text-text-muted/30" />
            <p className="text-sm font-medium text-text-muted">
              {hasFilters ? 'Nenhum registro encontrado' : 'Nenhum log de IA ainda'}
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
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Ação</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Modelo</th>
                    <th className="px-4 py-3 text-left font-semibold text-text-muted">Usuário</th>
                    <th className="px-4 py-3 text-right font-semibold text-text-muted">Tokens</th>
                    <th className="px-4 py-3 text-right font-semibold text-text-muted">Custo (USD)</th>
                    <th className="px-4 py-3 text-right font-semibold text-text-muted">Tempo</th>
                    <th className="px-4 py-3 text-center font-semibold text-text-muted">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-hover/30 transition-colors">
                      <td className="px-4 py-3 text-text-muted text-xs whitespace-nowrap">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${actionBadgeClass(log.action)}`}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted font-mono whitespace-nowrap">
                        {log.model}
                      </td>
                      <td className="px-4 py-3">
                        {log.user ? (
                          <div>
                            <p className="font-medium text-text text-xs">{log.user.name}</p>
                            <p className="text-text-muted text-xs">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">Sistema</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-text-muted whitespace-nowrap">
                        <span title={`Entrada: ${log.input_tokens} / Saída: ${log.output_tokens}`}>
                          {formatTokens(log.total_tokens)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-text whitespace-nowrap font-mono">
                        {formatCost(log.estimated_cost_usd)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-text-muted whitespace-nowrap">
                        {log.duration_ms}ms
                      </td>
                      <td className="px-4 py-3 text-center">
                        {log.success ? (
                          <CheckCircle size={16} className="inline text-green-500" />
                        ) : (
                          <span title={log.error_message ?? ''}>
                            <XCircle size={16} className="inline text-red-500" />
                          </span>
                        )}
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

export default AiLogsList;
