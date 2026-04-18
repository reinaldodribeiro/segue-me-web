'use client';

import { useToast } from './useToast';
import { useAuth } from './useAuth';

type ApiError = {
  status?: number;
  data?: {
    message?: string;
    errors?: Record<string, string[]>;
  };
};

export function useErrorHandler() {
  const { toast } = useToast();
  const { logOut } = useAuth();

  function handleError(err: unknown, context?: string) {
    if (context) console.error(`[${context}]`, err);

    const e = err as ApiError;

    switch (e?.status) {
      case 401:
        logOut();
        return;

      case 403:
        toast({ title: 'Sem permissão para realizar esta ação.', variant: 'error' });
        return;

      case 404:
        toast({ title: 'Recurso não encontrado.', variant: 'error' });
        return;

      case 409:
        toast({ title: e.data?.message ?? 'Conflito ao processar a solicitação.', variant: 'error' });
        return;

      case 422: {
        const firstError = e.data?.errors
          ? Object.values(e.data.errors).flat()[0]
          : e.data?.message;
        toast({ title: firstError ?? 'Dados inválidos.', variant: 'error' });
        return;
      }

      case 500:
        toast({ title: 'Erro interno do servidor. Tente novamente.', variant: 'error' });
        return;

      default:
        if (!e?.status) return;
        toast({ title: e.data?.message ?? 'Ocorreu um erro inesperado.', variant: 'error' });
    }
  }

  return { handleError };
}
