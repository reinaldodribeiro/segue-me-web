<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Patterns: Frontend (ui)

> Recurring code patterns with file references. Focus on performance, security, and maintainability.

## 1. Page Wrapper + PermissionGuard

Every protected page is a thin `'use client'` wrapper: `<PermissionGuard roles={[...]}><Feature /></PermissionGuard>`.
Ref: `src/app/app/people/page.tsx`, `src/app/app/encounters/page.tsx`

## 2. CrudService Extension

Extend `CrudService<T, P>` with `baseUrl()`. Override with `api.put()` for updates (Laravel expects PUT, not PATCH). Export as singleton.
Ref: `src/services/api/PersonService.ts`, `src/services/api/EncounterService.ts`, `src/services/api/CrudService.ts`

## 3. TanStack Query Hooks

Dedicated hooks per entity in `src/lib/query/hooks/`. Use `queryKeys` factory for all cache ops. `placeholderData: (prev) => prev` for seamless pagination transitions.
Ref: `src/lib/query/hooks/usePersons.ts`, `src/lib/query/keys.ts`

## 4. Mutation + Cache Invalidation

After mutations, invalidate queries instead of manual state updates. Invalidate both detail and list keys for consistency.
Ref: `src/lib/query/hooks/usePersons.ts` (`useUpdatePerson`, `useDeletePerson`)

## 5. initializedRef Guard

Prevent re-initializing form state after cache invalidation. Track last-initialized ID via `useRef<string | null>(null)`.
Ref: `src/features/People/Detail/index.tsx` (lines 102-119)

## 6. Debounced Search + Page Reset

`useDebounce(search, 400)` for search inputs. Always reset `page` to `1` when search or filters change.
Ref: `src/features/People/List/index.tsx` (lines 71, 88-109)

## 7. Hierarchy Cascade Selectors

`useHierarchyCascade` manages diocese -> sector -> parish dependent queries. Role determines starting point. 5min staleTime cache.
Ref: `src/hooks/useHierarchyCascade.ts`, `src/lib/query/hooks/useHierarchy.ts`

## 8. Error Handler Hook

`useErrorHandler().handleError(err, context?)` routes by HTTP status: 401->logout, 403/404/409/422/500->toast.
Ref: `src/hooks/useErrorHandler.ts`

## 9. Dynamic Import for Heavy Components

Recharts loaded via `next/dynamic` with `ssr: false` and skeleton loading. Reduces initial bundle for Dashboard.
Ref: `src/features/Dashboard/index.tsx` (lines 17-24)

## 10. Auth Token Dual Storage

Token in localStorage (client) AND synced to non-HttpOnly cookie (Edge Middleware). `syncAuthCookie()` runs on token change.
Ref: `src/context/AuthContext.tsx` (lines 40-42), `src/utils/authCookie.ts`

## 11. Permission Normalization

Spatie returns roles as objects or strings. `usePermissions()` normalizes to `UserRole[]`, memoizes, exposes `hasRole()`, `hasAnyRole()`, `canAccess()`, and convenience flags.
Ref: `src/hooks/usePermissions.ts`, `src/constants/permissions.ts`

## 12. EncounterTeams Context Pattern

Complex team-building uses dedicated context wrapping TanStack Query data, filters, and mutation actions. Avoids prop drilling across 6+ DnD components.
Ref: `src/context/EncounterTeamsContext.tsx`

## 13. Polling Pattern (Import Status)

`refetchInterval` returns `false` when status is terminal (`done`/`failed`). Interval: 2000ms.
Ref: `src/lib/query/hooks/usePersons.ts` (`useImportStatus`)

## 14. Duplicate Detection (409 Conflict)

POST returns 409 with `{ duplicates: [...] }`. UI shows warning modal; `force: true` bypasses check.
Ref: `src/features/People/New/index.tsx` (lines 174-228)

## 15. Storage URL Helper

Always use `storageUrl(path)` for backend-stored images. Never interpolate env var directly.
Ref: `src/utils/helpers.ts`

## 16. Enum Label Maps

Every enum has a `*_LABELS` companion map for display. Never hardcode Portuguese strings inline.
Ref: `src/interfaces/Person.ts` (`PERSON_TYPE_LABELS`)

## Anti-Patterns Detected

### AP1. Dashboard uses useEffect+setState instead of TanStack Query [Performance]
Loads encounters and people stats via raw `Promise.all` + `setState`. Bypasses query caching, deduplication, background refetch, and stale management. Should use custom query hooks.
Ref: `src/features/Dashboard/index.tsx` (lines 46-82)

### AP2. NewPerson loads data outside query layer [Performance]
Parish skills (line 107) and movements (line 114) fetched via `useEffect` + `setState` instead of query hooks. Misses cache sharing when navigating back.
Ref: `src/features/People/New/index.tsx` (lines 106-129)

### AP3. Auth token in non-HttpOnly cookie [Security]
JWT stored in client-accessible cookie for Edge Middleware. XSS could steal the token. Documented trade-off with planned migration to HttpOnly.
Ref: `src/utils/authCookie.ts`

### AP4. Auth token parsed from localStorage without validation [Security]
Token is `JSON.parse(localStorage.getItem('authToken'))` with no expiry check, no format validation. Expired tokens cause unnecessary API calls before 401 redirect.
Ref: `src/config/api.ts` (lines 24-26)

### AP5. No React.memo on list item renderers [Performance]
`SortableTable` renders cell functions inline. Large lists re-render all rows on any parent state change. Could benefit from memoized row components.
Ref: `src/features/People/List/index.tsx` (lines 293-408)
