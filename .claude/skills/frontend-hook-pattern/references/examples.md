<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Context Hook Examples

## useToast
Ref: `src/hooks/useToast.ts`
```ts
import { useContext } from 'react';
import { ToastContext, ToastContextData } from '@/context/ToastContext';

export function useToast(): ToastContextData {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
```

## useAuth
Ref: `src/hooks/useAuth.ts`
```ts
import { useContext } from 'react';
import { AuthContext, AuthContextData } from '@/context/AuthContext';

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
```

## useAnalytics
Ref: `src/hooks/useAnalytics.ts`
```ts
import { useContext } from 'react';
import { AnalyticsContext, AnalyticsContextData } from '@/context/AnalyticsContext';

export function useAnalytics(): AnalyticsContextData {
  const context = useContext(AnalyticsContext);
  if (!context) throw new Error('useAnalytics must be used inside <AnalyticsProvider>');
  return context;
}
```

## All 8 context hooks follow this exact pattern:
- `useAuth()` -> `AuthContextData` from `AuthContext`
- `useToast()` -> `ToastContextData` from `ToastContext`
- `useTheme()` -> `ThemeContextData` from `ThemeContext`
- `useLayout()` -> `LayoutContextData` from `LayoutContext`
- `useParishColor()` -> `ParishColorContextData` from `ParishColorContext`
- `useAnalytics()` -> `AnalyticsContextData` from `AnalyticsContext`
- `useEncounterTeams()` -> `EncounterTeamsContextData` from `EncounterTeamsContext`
- `useTutorialContext()` -> `TutorialContextValue` from `TutorialContext`
