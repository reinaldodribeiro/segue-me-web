<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Guards: Frontend (ui)

> DO/DON'T rules for the segue-me frontend. No code examples -- see patterns.md for references.

## Data Fetching

| DO | DON'T |
|----|-------|
| Use `useQuery`/`useMutation` from TanStack Query for all server state | Use `useState + useEffect + axios` for data fetching |
| Call `queryClient.invalidateQueries()` after mutations | Manually update React state after a mutation |
| Use `queryKeys.*` factory for all cache key references | Hardcode cache key arrays inline |
| Use `placeholderData: (prev) => prev` on list queries | Let lists flash empty on parameter change |
| Use `initializedRef` guard when initializing forms from query data | Initialize form in `useEffect` without guard (causes reset loops) |
| Use `enabled: !!id` to prevent queries with empty params | Fire queries with undefined/empty parameters |

## Performance

| DO | DON'T |
|----|-------|
| Lazy-load heavy components (Recharts, DnD) via `next/dynamic` with `ssr: false` | Import Recharts or DnD at the top level of common pages |
| Use `useDebounce(search, 400)` before passing search to query params | Pass raw search input to API queries (causes request per keystroke) |
| Reset `page` to `1` when filters or search change | Keep stale page number when filters change |
| Use TanStack Query `staleTime` and `gcTime` for cache management | Create custom in-memory caches outside React Query |
| Paginate large lists server-side | Load all records and filter client-side (except small datasets like dioceses) |

## Security

| DO | DON'T |
|----|-------|
| Use `useAuth()` hook for token and user access | Read `localStorage.getItem('authToken')` directly in components |
| Use `usePermissions()` for all role checks | Access `user.roles` directly (Spatie format varies) |
| Wrap every protected page in `<PermissionGuard roles={[...]}>` | Rely only on Edge Middleware for route protection |
| Handle 401 in `useErrorHandler` by calling `logOut()` | Show error toasts on 401 (user should be logged out) |
| Sync auth cookie via `syncAuthCookie(token)` on token change | Expect middleware to read localStorage (it runs on Edge) |
| Use `storageUrl(path)` for backend image URLs | Construct storage URLs by string interpolation |

## API / Services

| DO | DON'T |
|----|-------|
| Extend `CrudService<T, P>` and implement `baseUrl()` for new entities | Call `api.get/post/put` directly in feature components |
| Override with `api.put()` when backend expects PUT (not PATCH) | Assume `CrudService.update()` (PATCH) works for all entities |
| Use `updateFormData()` for multipart/form-data uploads | Manually set `Content-Type: multipart/form-data` |
| Use `useErrorHandler().handleError(err)` in all catch blocks | Show raw error objects or messages to users |
| Export services as singletons: `export default new XService()` | Create service instances in components |

## UI / Theming

| DO | DON'T |
|----|-------|
| Use semantic CSS variable tokens (`text-text`, `bg-panel`, `border-border`) | Use hardcoded Tailwind colors (`text-gray-900`, `bg-white`) |
| Use `cn(...classes)` from `src/utils/helpers.ts` for conditional classes | Use string concatenation for conditional Tailwind classes |
| Use `formatDate(value)` and `slugify(text)` from `src/utils/helpers.ts` | Call `new Intl.DateTimeFormat` or `toLocaleDateString` inline |
| Use companion enum label maps (`PERSON_TYPE_LABELS`, etc.) for display | Hardcode Portuguese display strings inline |

## Forms

| DO | DON'T |
|----|-------|
| Use `validate()` function returning boolean before submit | Submit without client-side validation |
| Clear individual field error on change: `setErrors(p => ({ ...p, field: undefined }))` | Clear all errors at once on any field change |
| Use `submitting` boolean state to disable submit button during request | Allow double-submit on slow connections |
| Use `confirmDelete` boolean state for delete confirmations | Use browser `confirm()` dialogs |

## Architecture

| DO | DON'T |
|----|-------|
| Keep page wrappers thin (only PermissionGuard + Feature component) | Put business logic in page.tsx files |
| Use feature folder convention (List/New/Detail) | Create feature components directly in `app/` directory |
| Use dedicated contexts for complex shared state (e.g., EncounterTeamsContext) | Pass 10+ props through 5+ component levels |
| Use `useHierarchyCascade` for diocese/sector/parish selectors | Build custom hierarchy loading with `useEffect` chains |
| Derive sidebar visibility from `ROUTE_PERMISSIONS` map | Maintain a separate navigation role map |
