'use client';

import { use } from 'react';
import EvaluationPage from '@/features/Evaluation';

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token: rawToken } = use(params);
  // Sanitize: extract only the UUID portion (handles cases where user pastes "token PIN: 1234")
  const token = rawToken.split(/[\s]+/)[0];
  return <EvaluationPage token={token} />;
}
