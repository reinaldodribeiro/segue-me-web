<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Patterns: Frontend (ui)

> Recurring code patterns with file references. Focus on performance, security, and maintainability.

## 1. SafeFC Component Declaration (Standardized)

All components use `const X: SafeFC<Props> = () => {}` with `export default X`. The `SafeFC<P>` type is globally declared in `src/types/global.d.ts` as `FunctionComponent<P & { children?: ReactNode }>`. For memoized components: `const X: SafeFC<Props> = memo(() => {})`. Exceptions: `React.forwardRef` components (Button, Input, Select, PasswordInput) keep their own pattern.
Ref: `src/types/global.d.ts`, `src/features/People/List/index.tsx`, `src/components/SectionCard/index.tsx`, `src/components/Layout/index.tsx`

## 2. Context Pattern (Standardized)

All 8 contexts follow: export `interface XContextData`, export `const XContext = createContext<XContextData>(...)`, export provider with `useCallback` on all functions and `const valueData: XContextData = useMemo(...)` for the value object. Contexts do NOT export hooks -- hooks live in `src/hooks/useX.ts`.
Ref: `src/context/ToastContext.tsx`, `src/context/ThemeContext.tsx`, `src/context/LayoutContext.tsx`

## 3. Context Hook Pattern (Standardized)

Every context hook lives in `src/hooks/useX.ts`. Signature: `export function useX(): XContextData`. Imports `XContext` + `XContextData` from the context file. Includes a null/empty check that throws an error if used outside the provider.
Ref: `src/hooks/useAuth.ts`, `src/hooks/useToast.ts`, `src/hooks/useLayout.ts`, `src/hooks/useTheme.ts`

## 4. Page Wrapper + PermissionGuard

Every protected page is a thin `'use client'` wrapper: `<PermissionGuard roles={[...]}><Feature /></PermissionGuard>`.
Ref: `src/app/app/people/page.tsx`, `src/app/app/encounters/page.tsx`

## 5. CrudService Extension

Extend `CrudService<T, P>` with `baseUrl()`. Override with `api.put()` for updates (Laravel expects PUT, not PATCH). Export as singleton.
Ref: `src/services/api/PersonService.ts`, `src/services/api/CrudService.ts`

## 6. TanStack Query Hooks

Dedicated hooks per entity in `src/lib/query/hooks/`. Use `queryKeys` factory for all cache ops. `placeholderData: (prev) => prev` for seamless pagination transitions.
Ref: `src/lib/query/hooks/usePersons.ts`, `src/lib/query/keys.ts`

## 7. Mutation + Cache Invalidation

After mutations, invalidate queries instead of manual state updates. Invalidate both detail and list keys for consistency.
Ref: `src/lib/query/hooks/usePersons.ts` (`useUpdatePerson`, `useDeletePerson`)

## 8. initializedRef Guard

Prevent re-initializing form state after cache invalidation. Track last-initialized ID via `useRef<string | null>(null)`.
Ref: `src/features/People/Detail/index.tsx`

## 9. Debounced Search + Page Reset

`useDebounce(search, 400)` for search inputs. Always reset `page` to `1` when search or filters change.
Ref: `src/features/People/List/index.tsx`

## 10. Hierarchy Cascade Selectors

`useHierarchyCascade` manages diocese -> sector -> parish dependent queries. Role determines starting point. 5min staleTime cache.
Ref: `src/hooks/useHierarchyCascade.ts`, `src/lib/query/hooks/useHierarchy.ts`

## 11. Error Handler Hook

`useErrorHandler().handleError(err, context?)` routes by HTTP status: 401->logout, 403/404/409/422/500->toast.
Ref: `src/hooks/useErrorHandler.ts`

## 12. Dynamic Import for Heavy Components

Recharts loaded via `next/dynamic` with `ssr: false` and skeleton loading. Reduces initial bundle.
Ref: `src/features/Dashboard/index.tsx`

## 13. Auth Token Dual Storage

Token in localStorage (client) AND synced to non-HttpOnly cookie (Edge Middleware). `syncAuthCookie()` runs on token change.
Ref: `src/context/AuthContext.tsx`, `src/utils/authCookie.ts`

## 14. Permission Normalization

Spatie returns roles as objects or strings. `usePermissions()` normalizes to `UserRole[]`, memoizes, exposes `hasRole()`, `hasAnyRole()`, `canAccess()`, and convenience flags.
Ref: `src/hooks/usePermissions.ts`, `src/constants/permissions.ts`

## 15. EncounterTeams Context Pattern

Complex team-building uses dedicated context wrapping TanStack Query data, filters, and mutation actions. Avoids prop drilling across 6+ DnD components.
Ref: `src/context/EncounterTeamsContext.tsx`

## 16. Polling Pattern (Import Status)

`refetchInterval` returns `false` when status is terminal (`done`/`failed`). Interval: 2000ms.
Ref: `src/lib/query/hooks/usePersons.ts` (`useImportStatus`)

## 17. Duplicate Detection (409 Conflict)

POST returns 409 with `{ duplicates: [...] }`. UI shows warning modal; `force: true` bypasses check.
Ref: `src/features/People/New/index.tsx`

## 18. Storage URL Helper

Always use `storageUrl(path)` for backend-stored images. Never interpolate env var directly.
Ref: `src/utils/helpers.ts`

## 19. Enum Label Maps

Every enum has a `*_LABELS` companion map for display. Never hardcode Portuguese strings inline.
Ref: `src/interfaces/Person.ts` (`PERSON_TYPE_LABELS`)

## 20. memo() Usage with SafeFC

Use named `memo` import (not `React.memo`). Combine with SafeFC: `const X: SafeFC<Props> = memo((...) => {})`. For named memo: `const X = memo(function X({...}: Props) { ... })`.
Ref: `src/components/Layout/index.tsx`, `src/features/People/Detail/HistorySection.tsx`, `src/components/Layout/Sidebar/NavItem/index.tsx`

## Anti-Patterns Detected

### AP1. Auth token in non-HttpOnly cookie [Security]
JWT stored in client-accessible cookie for Edge Middleware. XSS could steal the token. Documented trade-off with planned migration to HttpOnly.
Ref: `src/utils/authCookie.ts`

### AP2. Auth token parsed from localStorage without validation [Security]
Token is `JSON.parse(localStorage.getItem('authToken'))` with no expiry check, no format validation.
Ref: `src/config/api.ts`
