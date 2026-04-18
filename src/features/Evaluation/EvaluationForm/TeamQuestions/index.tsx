import { Star } from 'lucide-react';
import { TeamFormState } from '../types';

interface TeamQuestionsProps {
  form: TeamFormState;
  onChange: (field: keyof TeamFormState, value: string | number) => void;
  errors: Partial<Record<keyof TeamFormState, string>>;
}

function StarRating({
  value,
  onChange,
  label,
  error,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className="p-0.5 transition-colors"
          >
            <Star
              size={24}
              className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-border'}
            />
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const TeamQuestions: React.FC<TeamQuestionsProps> = ({ form, onChange, errors }) => {
  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-text border-b border-border pb-2">
        Avaliação Geral da Equipe
      </h3>

      <StarRating
        label="Como foi a preparação da equipe para o encontro?"
        value={form.preparation_rating}
        onChange={(v) => onChange('preparation_rating', v)}
        error={errors.preparation_rating}
      />
      <textarea
        placeholder="Comentário sobre a preparação (opcional)"
        value={form.preparation_comment}
        onChange={(e) => onChange('preparation_comment', e.target.value)}
        rows={2}
        className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
      />

      <StarRating
        label="O trabalho em equipe foi harmônico e colaborativo?"
        value={form.teamwork_rating}
        onChange={(v) => onChange('teamwork_rating', v)}
        error={errors.teamwork_rating}
      />
      <textarea
        placeholder="Comentário sobre o trabalho em equipe (opcional)"
        value={form.teamwork_comment}
        onChange={(e) => onChange('teamwork_comment', e.target.value)}
        rows={2}
        className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
      />

      <StarRating
        label="Os materiais e recursos foram adequados?"
        value={form.materials_rating}
        onChange={(v) => onChange('materials_rating', v)}
        error={errors.materials_rating}
      />
      <textarea
        placeholder="Comentário sobre materiais (opcional)"
        value={form.materials_comment}
        onChange={(e) => onChange('materials_comment', e.target.value)}
        rows={2}
        className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          Houve algum problema ou imprevisto durante o encontro?
        </label>
        <textarea
          placeholder="Descreva problemas ou imprevistos..."
          value={form.issues_text}
          onChange={(e) => onChange('issues_text', e.target.value)}
          rows={3}
          className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-text">
          O que poderia ser melhorado para o próximo encontro?
        </label>
        <textarea
          placeholder="Sugestões de melhoria..."
          value={form.improvements_text}
          onChange={(e) => onChange('improvements_text', e.target.value)}
          rows={3}
          className="w-full text-sm bg-input-bg border border-input-border text-input-text rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
        />
      </div>

      <StarRating
        label="Nota geral da participação da equipe"
        value={form.overall_team_rating}
        onChange={(v) => onChange('overall_team_rating', v)}
        error={errors.overall_team_rating}
      />
    </div>
  );
};

export default TeamQuestions;
