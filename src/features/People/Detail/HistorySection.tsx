'use client';

import { memo, useState, useMemo } from 'react';
import { History, ClipboardCheck, ChevronUp, Star, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import SectionCard from '@/components/SectionCard';
import { PersonHistory, TEAM_MEMBER_STATUS_LABELS } from '@/interfaces/Person';

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'text-green-600 bg-green-50',
  pending:   'text-amber-600 bg-amber-50',
  refused:   'text-red-600 bg-red-50',
};

const FULFILLED_LABELS: Record<string, string> = {
  yes:       'Sim',
  partially: 'Parcialmente',
  no:        'Não',
};

const RECOMMEND_LABELS: Record<string, string> = {
  yes:               'Sim',
  with_reservations: 'Com ressalvas',
  no:                'Não',
};

const FULFILLED_COLORS: Record<string, string> = {
  yes:       'text-green-600',
  partially: 'text-amber-600',
  no:        'text-red-500',
};

interface HistorySectionProps {
  history: PersonHistory[];
}

const HistorySection: SafeFC<HistorySectionProps> = memo(({ history }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const withEval = history.filter(h => h.evaluation);
    if (withEval.length === 0) return null;

    const avgCommitment =
      withEval.reduce((sum, h) => sum + h.evaluation!.commitment_rating, 0) / withEval.length;

    const recommendCount = withEval.filter(
      h => h.evaluation!.recommend === 'yes'
    ).length;
    const recommendPct = Math.round((recommendCount / withEval.length) * 100);

    return { avgCommitment, recommendPct, count: withEval.length };
  }, [history]);

  if (history.length === 0) return null;

  const headerAction = (
    <div className="flex items-center gap-3">
      {stats && (
        <>
          <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
            <Star size={12} className="fill-amber-400 stroke-amber-400" />
            {stats.avgCommitment.toFixed(1)}
            <span className="text-text-muted font-normal">/5</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <ThumbsUp size={12} />
            {stats.recommendPct}%
          </span>
          <span className="text-xs text-text-muted">
            {stats.count} {stats.count === 1 ? 'avaliação' : 'avaliações'}
          </span>
          <span className="w-px h-3 bg-border" />
        </>
      )}
      <History size={15} className="text-text-muted" />
    </div>
  );

  return (
    <SectionCard
      title="Histórico de Participação"
      action={headerAction}
    >
      <div className="space-y-3">
        {history.map((h) => {
          const isOpen = openId === h.id;
          const hasEval = !!h.evaluation;

          return (
            <div
              key={h.id}
              className="border-b border-border last:border-0"
            >
              {/* Row principal */}
              <div className="flex items-start justify-between gap-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">
                    {h.encounter ? (
                      <Link
                        href={`/app/encounters/${h.encounter.id}`}
                        className="hover:text-primary"
                      >
                        {h.encounter.name}
                        {h.encounter.edition_number
                          ? ` — ${h.encounter.edition_number}ª ed.`
                          : ''}
                      </Link>
                    ) : '—'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {h.encounter?.movement?.name}
                    {h.encounter?.date ? ` · ${h.encounter.date}` : ''}
                    {h.team ? ` · Equipe: ${h.team.name}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[h.status] ?? 'text-text-muted bg-hover'}`}>
                    {TEAM_MEMBER_STATUS_LABELS[h.status]}
                  </span>

                  {hasEval && (
                    <button
                      onClick={() => setOpenId(isOpen ? null : h.id)}
                      title="Ver avaliação recebida"
                      className="p-1 rounded-md text-text-muted hover:text-primary hover:bg-hover transition-colors"
                    >
                      {isOpen
                        ? <ChevronUp size={14} />
                        : <ClipboardCheck size={14} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Painel de avaliação */}
              {isOpen && h.evaluation && (
                <div className="mb-3 rounded-xl border border-border bg-hover/30 p-3 space-y-3 text-xs">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                    Avaliação recebida
                  </p>

                  {/* Notas em linha */}
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <span className="text-text-muted">Comprometimento</span>
                      <p className="font-semibold text-text text-sm mt-0.5">
                        {h.evaluation.commitment_rating}/5
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">Cumpriu responsabilidades</span>
                      <p className={`font-semibold text-sm mt-0.5 ${FULFILLED_COLORS[h.evaluation.fulfilled_responsibilities]}`}>
                        {FULFILLED_LABELS[h.evaluation.fulfilled_responsibilities]}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">Recomendam</span>
                      <p className={`font-semibold text-sm mt-0.5 ${FULFILLED_COLORS[h.evaluation.recommend === 'yes' ? 'yes' : h.evaluation.recommend === 'with_reservations' ? 'partially' : 'no']}`}>
                        {RECOMMEND_LABELS[h.evaluation.recommend]}
                      </p>
                    </div>
                  </div>

                  {/* Comentários */}
                  {h.evaluation.positive_highlight && (
                    <div>
                      <span className="text-text-muted block mb-0.5">Destaque positivo</span>
                      <p className="text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 leading-relaxed">
                        {h.evaluation.positive_highlight}
                      </p>
                    </div>
                  )}
                  {h.evaluation.issue_observed && (
                    <div>
                      <span className="text-text-muted block mb-0.5">Problema observado</span>
                      <p className="text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2 leading-relaxed">
                        {h.evaluation.issue_observed}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
});

HistorySection.displayName = 'HistorySection';

export default HistorySection;
