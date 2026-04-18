import { useState } from 'react';
import { Lock } from 'lucide-react';
import Button from '@/components/Button';
import EvaluationService from '@/services/api/EvaluationService';
import { PinVerificationProps } from './types';

const PinVerification: React.FC<PinVerificationProps> = ({ token, onVerified }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Digite o PIN de 4 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await EvaluationService.verifyPin(token, pin);
      onVerified(res.data.data.session_token, res.data.data.form);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ?? 'Erro ao verificar PIN.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-panel border border-border rounded-xl p-8 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <Lock size={24} className="text-primary" />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-bold text-text">Avaliação do Encontro</h1>
        <p className="text-sm text-text-muted mt-1">
          Digite o PIN de acesso fornecido pelo coordenador geral.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xs mx-auto">
        <div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
              setPin(v);
              setError('');
            }}
            placeholder="0000"
            className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-input-bg border border-input-border text-input-text rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Verificar
        </Button>
      </form>
    </div>
  );
};

export default PinVerification;
