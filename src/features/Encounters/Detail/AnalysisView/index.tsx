import { useEffect, useRef, useState } from 'react';
import { Brain, FileText, Loader2, RefreshCw } from 'lucide-react';
import Button from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import EvaluationService from '@/services/api/EvaluationService';
import { EncounterAnalysis } from '@/interfaces/Evaluation';
import { slugify } from '@/utils/helpers';
import { AnalysisViewProps } from './types';

const POLL_INTERVAL_MS = 4000;
const STORAGE_KEY = (id: string) => `ai_analysis_generating_${id}`;

const AnalysisView: SafeFC<AnalysisViewProps> = ({ encounterId, encounterName }) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [analysis, setAnalysis] = useState<EncounterAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTeam, setActiveTeam] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const res = await EvaluationService.getAnalysis(encounterId);
        const data = res.data.data;
        setAnalysis(data);

        if (data?.status === 'completed' || data?.status === 'failed') {
          stopPolling();
          setGenerating(false);
          localStorage.removeItem(STORAGE_KEY(encounterId));

          if (data.status === 'completed') {
            if (data.team_analyses?.length) {
              setActiveTeam(data.team_analyses[0].team_id);
            }
            toast({ title: 'Análise gerada com sucesso!', variant: 'success' });
          } else {
            toast({ title: 'Falha ao gerar análise.', variant: 'error' });
          }
        }
      } catch {
        // silently retry
      }
    }, POLL_INTERVAL_MS);
  }

  // On mount: fetch initial analysis and restore polling if needed
  useEffect(() => {
    async function load() {
      try {
        const res = await EvaluationService.getAnalysis(encounterId);
        const data = res.data.data;
        setAnalysis(data);

        if (data?.team_analyses?.length) {
          setActiveTeam(data.team_analyses[0].team_id);
        }

        const wasGenerating =
          data?.status === 'generating' ||
          localStorage.getItem(STORAGE_KEY(encounterId)) === '1';

        if (wasGenerating && data?.status !== 'completed' && data?.status !== 'failed') {
          setGenerating(true);
          startPolling();
        } else {
          // Clear stale storage key if already finished
          localStorage.removeItem(STORAGE_KEY(encounterId));
        }
      } catch {
        // no analysis yet
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => stopPolling();
  }, [encounterId]);

  async function handleGenerate() {
    setGenerating(true);
    localStorage.setItem(STORAGE_KEY(encounterId), '1');
    try {
      await EvaluationService.generateAnalysis(encounterId);
      startPolling();
    } catch (err: unknown) {
      handleError(err, 'handleGenerate()');
      setGenerating(false);
      localStorage.removeItem(STORAGE_KEY(encounterId));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-text-muted py-4 justify-center">
        <Loader2 size={14} className="animate-spin" />
        Carregando análise...
      </div>
    );
  }

  // Generating (in-progress)
  if (generating || analysis?.status === 'generating') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 size={20} className="animate-spin text-primary" />
        <p className="text-sm text-primary font-medium">
          Análise sendo gerada pela IA...
        </p>
        <p className="text-xs text-text-muted">
          Isso pode levar alguns instantes. Você pode navegar e voltar — o progresso será mantido.
        </p>
      </div>
    );
  }

  // No analysis yet or pending
  if (!analysis || analysis.status === 'pending') {
    return (
      <div className="space-y-3 text-center py-2">
        <p className="text-sm text-text-muted">
          Nenhuma análise gerada ainda. Gere a análise após os coordenadores enviarem as avaliações.
        </p>
        <Button
          size="sm"
          leftIcon={<Brain size={13} />}
          onClick={handleGenerate}
        >
          Gerar Análise
        </Button>
      </div>
    );
  }

  // Failed
  if (analysis.status === 'failed') {
    return (
      <div className="space-y-3 text-center py-2">
        <p className="text-sm text-red-600">Falha ao gerar análise.</p>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<RefreshCw size={13} />}
          onClick={handleGenerate}
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  // Completed
  const teamAnalyses = analysis.team_analyses ?? [];
  const activeTeamAnalysis = teamAnalyses.find((ta) => ta.team_id === activeTeam);

  return (
    <div className="space-y-4">
      {/* General Analysis */}
      <div>
        <h4 className="text-xs font-semibold text-text-muted mb-2">Análise Geral</h4>
        <div className="text-sm text-text leading-relaxed whitespace-pre-line">
          {analysis.general_analysis}
        </div>
      </div>

      {/* Per-team tabs */}
      {teamAnalyses.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-text-muted mb-2">Por Equipe</h4>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {teamAnalyses.map((ta) => (
              <button
                key={ta.team_id}
                onClick={() => setActiveTeam(ta.team_id)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                  activeTeam === ta.team_id
                    ? 'bg-primary text-white'
                    : 'bg-hover text-text hover:bg-border'
                }`}
              >
                {ta.team_name}
              </button>
            ))}
          </div>
          {activeTeamAnalysis && (
            <div className="text-sm text-text leading-relaxed whitespace-pre-line border border-border rounded-lg p-4">
              {activeTeamAnalysis.analysis}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<FileText size={13} />}
          onClick={() =>
            EvaluationService.downloadAnalysisPdf(
              encounterId,
              `analise-${slugify(encounterName)}.pdf`,
            )
          }
        >
          Baixar PDF da Análise
        </Button>
      </div>

      {analysis.generated_at && (
        <p className="text-[10px] text-text-muted">
          Gerada em: {new Date(analysis.generated_at).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  );
};

export default AnalysisView;
