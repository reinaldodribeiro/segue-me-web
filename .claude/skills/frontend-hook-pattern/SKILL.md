---
name: frontend-hook-pattern
description: "Pattern for context hooks in the segue-me frontend. Every context has a companion hook in
  src/hooks/useX.ts with explicit return type and error boundary. Use when creating a hook for a context,
  accessing context data, wiring a new provider, or the user says 'add hook', 'create useX', 'context hook',
  'use context', 'access provider data'."
---
<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Context Hook Pattern

Every context has a dedicated hook in `src/hooks/useX.ts`. The hook is the ONLY way to consume context data -- contexts never export their own hooks.

## Rules

- File location: `src/hooks/useX.ts` (one hook per file, matching context name)
- Signature: `export function useX(): XContextData` with explicit return type
- Import both `XContext` and `XContextData` from `@/context/XContext`
- Always check for null/undefined and throw a descriptive error
- Error message format: `'useX must be used within a XProvider'`
- Never return null/undefined -- always throw when context is missing

## Example

```ts
import { useContext } from 'react';
import { ToastContext, ToastContextData } from '@/context/ToastContext';

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
```
Ref: `src/hooks/useToast.ts`

## References

For full code examples with variants:
-> Read `references/examples.md`
