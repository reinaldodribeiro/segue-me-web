'use client';

import { useState, useEffect } from 'react';
import { EvaluationFormData } from '@/interfaces/Evaluation';
import PinVerification from './PinVerification';
import EvaluationForm from './EvaluationForm';
import EvaluationSuccess from './EvaluationSuccess';

interface EvaluationPageProps {
  token: string;
}

type Step = 'pin' | 'form' | 'success';

function sessionKey(token: string) {
  return `evaluation_session_${token}`;
}

function loadSession(token: string): { sessionToken: string; formData: EvaluationFormData } | null {
  try {
    const raw = localStorage.getItem(sessionKey(token));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(token: string, sessionToken: string, formData: EvaluationFormData) {
  try {
    localStorage.setItem(sessionKey(token), JSON.stringify({ sessionToken, formData }));
  } catch {
    // ignore
  }
}

function clearSession(token: string) {
  try {
    localStorage.removeItem(sessionKey(token));
  } catch {
    // ignore
  }
}

const EvaluationPage: SafeFC<EvaluationPageProps> = ({ token }) => {
  const [step, setStep] = useState<Step>('pin');
  const [sessionToken, setSessionToken] = useState('');
  const [formData, setFormData] = useState<EvaluationFormData | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = loadSession(token);
    if (saved) {
      if (saved.formData.already_submitted) {
        setStep('success');
      } else {
        setSessionToken(saved.sessionToken);
        setFormData(saved.formData);
        setStep('form');
      }
    }
  }, [token]);

  function handleVerified(session: string, data: EvaluationFormData) {
    if (data.already_submitted) {
      setStep('success');
      return;
    }
    setSessionToken(session);
    setFormData(data);
    saveSession(token, session, data);
    setStep('form');
  }

  function handleSuccess() {
    clearSession(token);
    setStep('success');
  }

  if (step === 'pin') {
    return <PinVerification token={token} onVerified={handleVerified} />;
  }

  if (step === 'form' && formData) {
    return (
      <EvaluationForm
        token={token}
        sessionToken={sessionToken}
        formData={formData}
        onSuccess={handleSuccess}
      />
    );
  }

  return <EvaluationSuccess />;
};

export default EvaluationPage;
