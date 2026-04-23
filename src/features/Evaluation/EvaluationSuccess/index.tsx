import { CheckCircle2 } from 'lucide-react';

const EvaluationSuccess: SafeFC = () => {
  return (
    <div className="bg-panel border border-border rounded-xl p-8 text-center space-y-4">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-600" />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-text">Avaliação Enviada!</h1>
        <p className="text-sm text-text-muted mt-2 max-w-sm mx-auto">
          Obrigado por preencher a avaliação da equipe. Suas respostas serão utilizadas para
          gerar a análise do encontro.
        </p>
      </div>

      <p className="text-xs text-text-muted">Você já pode fechar esta página.</p>
    </div>
  );
};

export default EvaluationSuccess;
