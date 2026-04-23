# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 16.2 (App Router, Turbopack), React 19.0, TypeScript 5 (strict), Tailwind CSS 3.4 (CSS variable tokens), Axios 1.7, TanStack Query v5, @dnd-kit 6/10, Recharts 3.8, Lucide React.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run start        # Start production server
npm run test         # Jest tests
npm run test:watch   # Jest in watch mode
npx tsc --noEmit     # Type-check without emitting
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

`NEXT_PUBLIC_STORAGE_URL` is used via `storageUrl()` in `src/utils/helpers.ts` to convert backend storage paths (e.g. `/parishes/.../logo/file.png`) into full public URLs.

## Architecture Overview

This is a **Next.js 16 App Router** frontend for a Parish Meeting Management System ("Segue-me"). It uses TypeScript strict mode, Tailwind CSS with CSS variables for theming, and Axios for API calls.

### Component Declaration (SafeFC)

All components use the global `SafeFC<P>` type declared in `src/types/global.d.ts`. Never import it -- it is globally available.

```ts
// Standard component
const PeopleList: SafeFC = () => { ... };
export default PeopleList;

// Component with props
const SectionCard: SafeFC<SectionCardProps> = ({ title, children }) => { ... };
export default SectionCard;

// Memoized component
const Layout: SafeFC<LayoutProps> = memo(({ children }) => { ... });
export default Layout;
```

**Exceptions**: `React.forwardRef` components (Button, Input, Select, PasswordInput) keep their own pattern.

### Context Pattern (Standardized)

All 8 contexts follow the same structure in `src/context/XContext.tsx`:
1. Export `interface XContextData` with all public fields/functions
2. Export `const XContext = createContext<XContextData>(...)`
3. Export `XProvider` with `useCallback` on all functions and `const valueData: XContextData = useMemo(...)`
4. Context does NOT export a hook

### Context Hook Pattern (Standardized)

Every context hook lives in `src/hooks/useX.ts`:
```ts
export function useX(): XContextData {
  const context = useContext(XContext);
  if (!context) throw new Error('useX must be used within a XProvider');
  return context;
}
```
This is the ONLY way to consume context data.

### Route Structure

All protected pages live under `src/app/app/`. Public auth pages live under `src/app/auth/`. The `app-layout.tsx` file acts as the client-side auth gate — it checks `isLogged` and redirects to `/auth/login` if unauthenticated.

Every protected page component is wrapped in `<PermissionGuard roles={[...]}>` which enforces role-based access client-side and redirects if denied.

### Permission System

**Single source of truth:** `src/constants/permissions.ts` — the `ROUTE_PERMISSIONS` map defines which roles can access each route. The Sidebar derives its visible items from this map via `canAccess(href)`.

**Hook:** `usePermissions()` in `src/hooks/usePermissions.ts` exposes `hasRole()`, `hasAnyRole()`, `canAccess()`, and convenience flags (`isSuperAdmin`, `isDioceseAdmin`, etc.).

**Critical normalization:** Spatie Laravel Permission returns roles as objects `{id, name, guard_name}` OR plain strings depending on the endpoint. The hook normalizes both:
```ts
const userRoles = (user?.roles ?? []).map((r) =>
  typeof r === 'string' ? r : (r as { name: string }).name
) as UserRole[];
```
Never call `.includes('role_name')` directly on `user.roles` — always go through `usePermissions`.

### Five Roles & Hierarchy

```
super_admin > diocese_admin > sector_admin > parish_admin > coordinator
```

- `super_admin` — unrestricted access everywhere (backend `before()` policy)
- `diocese_admin` — manages sectors, parishes, users within own diocese
- `sector_admin` — manages parishes and users within own sector
- `parish_admin` — full CRUD within own parish; can create coordinators
- `coordinator` — people + encounters within own parish only

`PersonPolicy.viewAny` is scoped to `parish_admin` + `coordinator` only (NOT diocese/sector admins). `EncounterPolicy/MovementPolicy.viewAny` includes `diocese_admin` and above.

### API Client

**Axios instance:** `src/config/api.ts` — sets `baseURL` to `NEXT_PUBLIC_API_URL`, attaches `Authorization: Bearer {token}` from localStorage on every request, and throws `error.response` on API errors (so catch blocks receive `{ status, data }` directly).

**CrudService:** Abstract base class in `src/services/api/CrudService.ts`. Extend it and implement `baseUrl()`:
```ts
class DioceseService extends CrudService<Diocese, DiocesePayload> {
  protected baseUrl() { return 'dioceses'; }
}
```
Provides `list()`, `search()`, `save()`, `update()` (PATCH), `updateFormData()`, `delete()`.

**Important:** The Laravel backend expects **PUT** for updates, not PATCH. `CrudService.update()` uses PATCH. Services that need update must override with `api.put()` directly (see `ParishService.put()`, `SectorService.update()`).

### Data Loading Pattern for Hierarchical Data

The backend has no flat `GET /parishes` or `GET /sectors` endpoints. Lists are loaded by traversing the hierarchy in parallel:

```ts
// super_admin: dioceses → sectors → parishes (3 rounds, parallel per round)
const dioceses = await DioceseService.list({ per_page: 200 });
const sectors = await Promise.all(dioceses.map(d => SectorService.listByDiocese(d.id)));
const parishes = await Promise.all(sectors.map(s => ParishService.listBySector(s.id)));
```

Role determines the starting point: `sector_admin` starts at their sector, `diocese_admin` at their diocese, `super_admin` loads everything. All filtering is then done client-side with `useMemo`.

### Theming

Tailwind is configured to use CSS variables. Always use semantic tokens, never hardcoded colors:

| Token | Usage |
|---|---|
| `text-text` | Primary text |
| `text-text-muted` | Secondary/muted text |
| `bg-panel` | Card/panel backgrounds |
| `border-border` | Borders |
| `bg-hover` | Hover states |
| `text-primary` / `bg-primary` | Brand color (purple `#6d28d9`) |
| `bg-input-bg`, `border-input-border`, `text-input-text` | Form inputs |

Dark mode uses `[data-theme="dark"]` selector set by `ThemeProvider`.

### Toast Notifications

```ts
const { toast } = useToast();
toast({ title: 'Salvo!', variant: 'success' }); // 'success' | 'error' | 'info' | 'warning'
```

### Context Providers (outermost → innermost)

`QueryProvider` → `ToastProvider` → `ThemeProvider` → `ParishColorProvider` → `LayoutProvider` → `AuthProvider` → `TutorialProvider`

All are in `src/app/providers.tsx`. Access via their respective hooks (`useToast`, `useTheme`, `useParishColor`, `useLayout`, `useAuth`, `useTutorial`). Protected app pages additionally wrap with `AnalyticsProvider`.

### Feature Folder Structure

Each major feature lives under `src/features/FeatureName/` with `New/index.tsx`, `List/index.tsx`, and `Detail/index.tsx`. Page files under `src/app/app/` are thin wrappers that apply `<PermissionGuard>` and render the feature component:

```ts
'use client';
export default function Page() {
  return <PermissionGuard roles={[...]}><FeatureList /></PermissionGuard>;
}
```

### Form Pattern

Forms use three local state variables: `form` (field values), `errors` (field-level messages), `submitting` (boolean). Validation runs in a `validate()` function that populates `errors` and returns a boolean. Clear individual errors on field change: `setErrors(p => ({ ...p, fieldName: undefined }))`. Delete confirmations use a separate `confirmDelete` boolean state.

### Pagination & Filtering

Use `useDebounce(search, 400)` for debounced search input. Always reset `page` to `1` when filters or search change. Query params shape:
```ts
const params: Record<string, unknown> = { per_page: 30, page };
if (debouncedSearch) params.search = debouncedSearch;
```

### Data Fetching — TanStack Query v5

All server state is managed with `@tanstack/react-query`. **Never use `useState + useEffect + axios` for data fetching.** Always use the hooks in `src/lib/query/hooks/`.

#### Structure

```
src/lib/query/
  client.ts       — QueryClient singleton (staleTime: 2min, gcTime: 10min, retry: 1)
  provider.tsx    — QueryClientProvider + ReactQueryDevtools wrapper
  keys.ts         — Hierarchical query key factory
  hooks/
    usePersons.ts, useEncounters.ts, useMovements.ts, useParishes.ts,
    useDioceses.ts, useSectors.ts, useUsers.ts, useAudit.ts, useAiApiLogs.ts,
    useHierarchy.ts, useEngagement.ts
```

#### Key Patterns

**Reading data:**
```ts
const { data: encounter, isLoading } = useEncounter(id);
```

**After mutations, invalidate instead of `setState`:**
```ts
const queryClient = useQueryClient();
await EncounterService.put(id, payload);
queryClient.invalidateQueries({ queryKey: queryKeys.encounters.detail(id) });
```

**Form initialization from query data — use `initializedRef` to avoid resetting after cache invalidation:**
```ts
const initializedRef = useRef<string | null>(null);
useEffect(() => {
  if (!data || initializedRef.current === id) return;
  initializedRef.current = id;
  setName(data.name); // etc.
}, [data, id]);
```

**Polling (import status):**
```ts
const { data } = useImportStatus(cacheKey); // stops polling automatically on done/failed
```

**Hierarchy cascade:** Use `useHierarchyDioceses`, `useHierarchySectors(dioceseId)`, `useHierarchyParishes(sectorId)` — these replace the deleted `hierarchyCache.ts`.

#### Query Key Factory (`keys.ts`)

Use `queryKeys.*` for all cache operations:
- `queryKeys.encounters.detail(id)` — single encounter
- `queryKeys.encounters.lists()` — all encounter lists
- `queryKeys.encounters.all` — everything related to encounters
- Same pattern for `persons`, `movements`, `parishes`, `dioceses`, `sectors`, `users`

### Service URL Helpers

Some service methods return a URL string (not a Promise) for use directly in `href` or download triggers:
- `PersonService.importTemplateUrl()` — import spreadsheet template
- `PersonService.exportExcelUrl(params?)` — Excel export with optional filters
- `EncounterService.reportPdfUrl(id)` — PDF report link

### Duplicate Detection (People)

`POST /people` returns HTTP 409 with `{ data: { duplicates: [...] } }` when a similar record exists. The UI shows a warning modal; passing `force: true` in the payload bypasses the check.

### Enum Label Maps

Every enum type has a companion label map (e.g. `PERSON_TYPE_LABELS`, `ENGAGEMENT_LEVEL_LABELS`, `ENCOUNTER_STATUS_LABELS`, `ROLE_LABELS`). Always use these maps for display — never hardcode Portuguese strings inline.

### Auth Storage

`AuthContext` stores `authToken` (JWT string) and `userData` (JSON-serialized User) in localStorage. A 401 response triggers logout + redirect to `/auth/login`. Token is read back via `JSON.parse`.

### Key Patterns

**Error handling in services:**
```ts
} catch (err: unknown) {
  const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Fallback message';
}
```

**Cascade selectors (diocese → sector → parish):** Use a `pendingSectorRef` / `useRef` to restore a pre-selected value after async cascade data loads. See `src/app/app/parishes/new/page.tsx`.

**`storageUrl()` helper:** Always use it when displaying images from the backend — never interpolate `NEXT_PUBLIC_STORAGE_URL` directly.

**`cn()` helper** in `src/utils/helpers.ts`: simple classname combinator — filters falsy values and joins with space. Use instead of string concatenation for conditional classes.

**Date formatting:** Use `formatDate(value, options?)` from `src/utils/helpers.ts` — wraps `Intl.DateTimeFormat('pt-BR')` and returns `'—'` for null/undefined.

## Scan References

| File | Description |
|------|-------------|
| `.claude/commands/stack.md` | Technology stack, dependency versions, project structure, build analysis |
| `.claude/commands/features.md` | Feature inventory, folder conventions, complexity matrix, performance analysis |
| `.claude/commands/patterns.md` | 20 recurring patterns + 2 anti-patterns with file references |
| `.claude/commands/guards.md` | DO/DON'T rules for components, contexts, hooks, data fetching, security, API, UI, forms, architecture |
| `.claude/commands/recipes.md` | Step-by-step implementation recipes with file hierarchies |
| `.claude/commands/notes.md` | Manual notes (never overwritten by scan) |

## Guards

### Component Declaration
- Always declare components as `const X: SafeFC<Props> = () => {}` — never use `React.FC`, `function X()`, or untyped arrows
- Always export as `export default X` at the bottom — never inline export
- Use `memo()` named import for memoized components — never `React.memo()`
- Never convert `React.forwardRef` components (Button, Input, Select, PasswordInput) to SafeFC
- Never import SafeFC — it is a global type from `src/types/global.d.ts`

### Context & Hooks
- Context files export only `XContextData` interface, `XContext`, and `XProvider` — never export a hook
- All context functions must be wrapped in `useCallback`
- Context value must use `const valueData: XContextData = useMemo(...)` with explicit type
- Context hooks must live in `src/hooks/useX.ts` with explicit return type `useX(): XContextData`
- Context hooks must throw if context is null/undefined — never return null

### Data & Security
- Never access `user.roles` directly — always use `usePermissions()`
- Never use `useState + useEffect + axios` for data fetching — use TanStack Query hooks
- After mutations: `queryClient.invalidateQueries()` — never manually update state
- Never hardcode Tailwind color classes — use CSS variable tokens (`text-text`, `bg-panel`, etc.)
- Always use `storageUrl(path)` for backend storage image paths
- Always use `cn()` for conditional class merging
- Always use `formatDate()` and `slugify()` from `src/utils/helpers.ts`
- Always use enum label maps for display strings — never hardcode Portuguese inline
- Every protected page must be wrapped in `<PermissionGuard roles={[...]}>`
- Use `initializedRef` guard in Detail forms to prevent re-init after cache invalidation
- Backend expects PUT (not PATCH) for updates — override `CrudService.update()` with `api.put()`
- Always use `useErrorHandler().handleError(err)` in catch blocks — never show raw errors
- Lazy-load heavy components (Recharts, DnD) via `next/dynamic` with `ssr: false`
- Keep page wrappers thin — only PermissionGuard + Feature component, no business logic
- Use `useDebounce(search, 400)` before passing search to query params
- Use `useAuth()` for token/user — never read `localStorage` directly in components

## Recommended Skills

- `frontend-safefc-component` — SafeFC<P> component declaration, export default, memo handling, forwardRef exceptions
- `frontend-context-pattern` — Context creation with XContextData, useMemo valueData, useCallback, no hook export
- `frontend-hook-pattern` — Context hooks in /hooks/useX.ts, explicit return type, error boundary
- `frontend-crud-service` — Extending CrudService, PUT override, custom service methods, blob downloads
- `frontend-query-hooks` — TanStack Query v5: useQuery, useMutation, keys, polling, parallel queries
- `frontend-permission-guard` — PermissionGuard, usePermissions, ROUTE_PERMISSIONS map, role normalization
- `frontend-feature-page` — Feature folder structure, thin page wrappers, SafeFC, list/form checklist
- `frontend-hierarchy-cascade` — Diocese→Sector→Parish cascade selectors, parallel sector loading
- `frontend-form-pattern` — Form state, validation, error clearing, delete confirmation, initializedRef
- `frontend-error-handling` — useErrorHandler hook, HTTP status routing, toast notifications
- `frontend-encounter-teams` — EncounterTeamsContext, DnD team assembly, coordinator slot validation
