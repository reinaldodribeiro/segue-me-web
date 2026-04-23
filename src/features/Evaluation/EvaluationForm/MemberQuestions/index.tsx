import { useState } from 'react';
import { ChevronDown, ChevronUp, Star, User } from 'lucide-react';
import { MemberFormState } from '../types';

interface MemberQuestionsProps {
  members: MemberFormState[];
  onChange: (index: number, field: keyof MemberFormState, value: string | number) => void;
  errors: Record<string, string>;
}

function MemberStarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star
            size={18}
            className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-border'}
          />
        </button>
      ))}
    </div>
  );
}

const MemberQuestions: SafeFC<MemberQuestionsProps> = ({ members, onChange, errors }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
        Avaliação Individual dos Membros
      </h3>

      {members.map((member, idx) => {
        const isExpanded = expandedIndex === idx;
        const hasError = Object.keys(errors).some((k) => k.startsWith(`members.${idx}`));
        const isComplete =
          member.commitment_rating > 0 &&
          member.fulfilled_responsibilities !== '' &&
          member.recommend !== '';

        return (
          <div
            key={member.team_member_id}
            className={`border rounded-lg overflow-hidden ${hasError ? 'border-red-300' : 'border-border'}`}
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className="w-full flex items-center justify-between px-4 py-3 bg-hover text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                <User size={14} className="text-text-muted shrink-0" />
                <span className="text-sm font-medium text-text truncate">
                  {member.person_name}
                </span>
                {isComplete && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                    Preenchido
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {isExpanded && (
              <div className="px-4 py-4 space-y-4">
                {/* Commitment Rating */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text">
                    Nível de comprometimento e participação
                  </label>
                  <MemberStarRating
                    value={member.commitment_rating}
                    onChange={(v) => onChange(idx, 'commitment_rating', v)}
                  />
                  {errors[`members.${idx}.commitment_rating`] && (
                    <p className="text-xs text-red-600">{errors[`members.${idx}.commitment_rating`]}</p>
                  )}
                </div>

                {/* Fulfilled Responsibilities */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text">
                    Cumpriu suas responsabilidades?
                  </label>
                  <div className="flex gap-2">
                    {([
                      ['yes', 'Sim'],
                      ['partially', 'Parcialmente'],
                      ['no', 'Não'],
                    ] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onChange(idx, 'fulfilled_responsibilities', val)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          member.fulfilled_responsibilities === val
                            ? 'bg-primary text-white border-primary'
                            : 'bg-input-bg text-text border-input-border hover:bg-hover'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors[`members.${idx}.fulfilled_responsibilities`] && (
                    <p className="text-xs text-red-600">{errors[`members.${idx}.fulfilled_responsibilities`]}</p>
                  )}
                </div>

                {/* Positive Highlight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text">
                    Destaque positivo <span className="text-text-muted">(opcional)</span>
                  </label>
                  <textarea
                    placeholder="Algum destaque positivo deste membro..."
                    value={member.positive_highlight}
                    onChange={(e) => onChange(idx, 'positive_highlight', e.target.value)}
                    rows={2}
                    className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                {/* Issue Observed */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text">
                    Problema ou dificuldade observada <span className="text-text-muted">(opcional)</span>
                  </label>
                  <textarea
                    placeholder="Algum problema ou dificuldade..."
                    value={member.issue_observed}
                    onChange={(e) => onChange(idx, 'issue_observed', e.target.value)}
                    rows={2}
                    className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                {/* Recommend */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text">
                    Recomenda para próximos encontros?
                  </label>
                  <div className="flex gap-2">
                    {([
                      ['yes', 'Sim'],
                      ['with_reservations', 'Com ressalvas'],
                      ['no', 'Não'],
                    ] as const).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => onChange(idx, 'recommend', val)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          member.recommend === val
                            ? 'bg-primary text-white border-primary'
                            : 'bg-input-bg text-text border-input-border hover:bg-hover'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors[`members.${idx}.recommend`] && (
                    <p className="text-xs text-red-600">{errors[`members.${idx}.recommend`]}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MemberQuestions;
