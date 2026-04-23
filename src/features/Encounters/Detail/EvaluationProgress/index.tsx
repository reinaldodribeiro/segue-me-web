import { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, RefreshCw, Link2, Users } from 'lucide-react';
import Button from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import EvaluationService from '@/services/api/EvaluationService';
import { TeamEvaluationToken, EVALUATION_STATUS_LABELS } from '@/interfaces/Evaluation';
import { resolveTeamIcon } from '@/components/TeamIconPicker';
import { EvaluationProgressProps } from './types';

const EvaluationProgress: SafeFC<EvaluationProgressProps> = ({
  encounterId,
  isCompleted,
}) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const [tokens, setTokens] = useState<TeamEvaluationToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [whatsappId, setWhatsappId] = useState<string | null>(null);

  useEffect(() => {
    if (!isCompleted) return;
    EvaluationService.getTokens(encounterId)
      .then((res) => setTokens(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [encounterId, isCompleted]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await EvaluationService.generateTokens(encounterId);
      setTokens(res.data.data);
      toast({ title: 'Links de avaliação gerados.', variant: 'success' });
    } catch (err: unknown) {
      handleError(err, 'handleGenerate()');
    } finally {
      setGenerating(false);
    }
  }

  function copyLink(evaluation: TeamEvaluationToken) {
    navigator.clipboard.writeText(evaluation.public_url).then(() => {
      setCopiedId(evaluation.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  function copyMessage(evaluation: TeamEvaluationToken) {
    const text = `Olá! Acesse o link abaixo para avaliar o encontro da equipe *${evaluation.team_name}*:\n\n${evaluation.public_url}\n\nPIN de acesso: *${evaluation.pin}*`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMsgId(evaluation.id);
      setTimeout(() => setCopiedMsgId(null), 2000);
    });
  }

  function shareWhatsApp(evaluation: TeamEvaluationToken) {
    const text = `Olá! Acesse o link abaixo para avaliar o encontro da equipe *${evaluation.team_name}*:\n\n${evaluation.public_url}\n\nPIN de acesso: *${evaluation.pin}*`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setWhatsappId(evaluation.id);
    setTimeout(() => setWhatsappId(null), 2000);
  }

  if (!isCompleted) return null;
  if (loading) return <div className="text-xs text-text-muted py-4 text-center">Carregando avaliações...</div>;

  const submitted = tokens.filter((t) => t.status === 'submitted').length;
  const total = tokens.length;

  return (
    <div className="space-y-4">
      {tokens.length === 0 ? (
        <div className="text-center space-y-3">
          <p className="text-sm text-text-muted">Nenhum link de avaliação gerado ainda.</p>
          <Button
            size="sm"
            leftIcon={<Link2 size={13} />}
            loading={generating}
            onClick={handleGenerate}
          >
            Gerar links de avaliação
          </Button>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Progresso das avaliações</span>
              <span className="font-medium text-text">
                {submitted}/{total} equipes
              </span>
            </div>
            <div className="h-2 bg-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${total > 0 ? (submitted / total) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Team list */}
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {tokens.map((token) => (
              <div
                key={token.id}
                className="px-4 py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {(() => { const Icon = resolveTeamIcon(token.team_icon) ?? Users; return <Icon size={12} className="text-text-muted shrink-0" />; })()}
                    <span className="text-sm font-medium text-text truncate">
                      {token.team_name}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                        token.status === 'submitted'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {EVALUATION_STATUS_LABELS[token.status]}
                    </span>
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5 font-mono">
                    PIN: {token.pin}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => shareWhatsApp(token)}
                    className="p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                    title="Enviar via WhatsApp"
                  >
                    {whatsappId === token.id ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <svg viewBox="0 0 24 24" width={14} height={14} className="text-green-600 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => copyMessage(token)}
                    className="p-1.5 rounded-lg hover:bg-hover transition-colors"
                    title="Copiar mensagem completa"
                  >
                    {copiedMsgId === token.id ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} className="text-text-muted" />
                    )}
                  </button>
                  <a
                    href={token.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-hover transition-colors"
                    title="Abrir link"
                  >
                    <ExternalLink size={14} className="text-text-muted" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Regenerate button */}
          <div className="flex justify-end">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RefreshCw size={12} />}
              loading={generating}
              onClick={handleGenerate}
            >
              Regenerar links
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default EvaluationProgress;
