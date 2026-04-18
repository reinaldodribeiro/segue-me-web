<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Error Handling Examples

## useErrorHandler hook implementation
Ref: `src/hooks/useErrorHandler.ts`
```ts
export function useErrorHandler() {
  const { toast } = useToast();
  const { logOut } = useAuth();

  function handleError(err: unknown, context?: string) {
    if (context) console.error(`[${context}]`, err);
    const e = err as ApiError;

    switch (e?.status) {
      case 401: logOut(); return;
      case 403: toast({ title: 'Sem permissao.', variant: 'error' }); return;
      case 404: toast({ title: 'Recurso nao encontrado.', variant: 'error' }); return;
      case 409: toast({ title: e.data?.message ?? 'Conflito.', variant: 'error' }); return;
      case 422: {
        const firstError = e.data?.errors
          ? Object.values(e.data.errors).flat()[0]
          : e.data?.message;
        toast({ title: firstError ?? 'Dados invalidos.', variant: 'error' });
        return;
      }
      case 500: toast({ title: 'Erro interno do servidor.', variant: 'error' }); return;
    }
  }

  return { handleError };
}
```

## Usage in form submit
Ref: `src/features/People/Detail/index.tsx`
```ts
const { handleError } = useErrorHandler();

async function handleSave(e: React.SyntheticEvent) {
  e.preventDefault();
  setSaving(true);
  try {
    await PersonService.put(id, payload);
    queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
    toast({ title: 'Dados atualizados.', variant: 'success' });
  } catch (err: unknown) {
    handleError(err, 'handleSave()');
  } finally {
    setSaving(false);
  }
}
```

## Special case: 409 duplicate detection
Ref: `src/features/People/New/index.tsx`
```ts
// Handle 409 separately for duplicate modal, fallback to handleError for everything else
try {
  await PersonService.save(payload);
} catch (err: unknown) {
  const e = err as { status?: number; data?: { duplicates?: Duplicate[] } };
  if (e?.status === 409 && e.data?.duplicates) {
    setDuplicates(e.data.duplicates);  // Show duplicate warning modal
  } else {
    handleError(err, 'handleSubmit()');
  }
}
```
