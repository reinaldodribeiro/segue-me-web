---
name: frontend-context-pattern
description: "Pattern for creating React contexts in the segue-me frontend. Covers the XContextData interface,
  createContext call, provider with useMemo valueData and useCallback functions, and the rule that contexts
  never export hooks. Use when creating a new context, adding a provider, sharing state across components,
  or the user says 'new context', 'add provider', 'create context', 'shared state', 'context pattern'."
---
<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Context Pattern

All 8 contexts follow the same standardized structure. The context file exports the interface, context, and provider. It does NOT export a hook -- hooks live in `src/hooks/useX.ts`.

## Rules

- Export `interface XContextData` with all public fields and functions
- Export `const XContext = createContext<XContextData | undefined>(undefined)` (or null for optional contexts)
- Wrap ALL provider functions in `useCallback`
- Create `const valueData: XContextData = useMemo(() => ({...}), [deps])` with explicit type annotation
- Pass `valueData` to the Provider's `value` prop
- The provider is `export const XProvider: React.FC<{ children: React.ReactNode }>`
- Never export a `useX()` hook from the context file
- File location: `src/context/XContext.tsx`

## Example

```tsx
export interface XContextData {
  value: string;
  setValue: (v: string) => void;
}

export const XContext = createContext<XContextData | undefined>(undefined);

export const XProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('');
  const setValueCb = useCallback((v: string) => setValue(v), []);
  const valueData: XContextData = useMemo(() => ({ value, setValue: setValueCb }), [value, setValueCb]);
  return <XContext.Provider value={valueData}>{children}</XContext.Provider>;
};
```
Ref: `src/context/ToastContext.tsx`

## References

For full code examples with variants:
-> Read `references/examples.md`
