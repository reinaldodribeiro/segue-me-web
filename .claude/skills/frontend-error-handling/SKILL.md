---
name: frontend-error-handling
description: "Pattern for error handling in the segue-me frontend. Covers useErrorHandler hook, HTTP status
  routing (401/403/404/409/422/500), toast notifications, and the error type casting pattern.
  Use when adding error handling to a form, catch block, or mutation callback, or the user says
  'handle error', 'show error toast', 'catch API error', '401 handling', 'error message'."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Error Handling Pattern

All API error handling flows through `useErrorHandler().handleError(err, context?)`. It maps HTTP status codes to appropriate user-facing toast messages. 401 triggers automatic logout.

## Pattern

Rules:
- Always use `useErrorHandler` in catch blocks -- never show raw errors to users
- 401 response triggers `logOut()` automatically -- no manual handling needed
- 422 extracts the first validation error from `errors` object
- 409 shows the backend message (often duplicate detection)
- Pass a `context` string (e.g. function name) for console logging
- The Axios response interceptor throws `error.response` (not the raw AxiosError), so catch blocks receive `{ status, data }` directly

## Example

```ts
const { handleError } = useErrorHandler();
const { toast } = useToast();

async function handleSubmit() {
  try {
    await PersonService.save(payload);
    toast({ title: 'Salvo!', variant: 'success' });
  } catch (err) {
    handleError(err, 'handleSubmit()');
  }
}
```
Ref: `src/hooks/useErrorHandler.ts`

## Status Code Routing

| Status | Action |
|--------|--------|
| 401 | `logOut()` -- redirect to login |
| 403 | Toast: "Sem permissao" |
| 404 | Toast: "Recurso nao encontrado" |
| 409 | Toast: backend message or "Conflito" |
| 422 | Toast: first validation error or "Dados invalidos" |
| 500 | Toast: "Erro interno do servidor" |

## References

For full code examples:
-> Read `references/examples.md`
