<!-- mustard:generated at:2026-04-01T20:20:04Z role:ui -->

# Guards: Frontend (ui)

> DO/DON'T rules extracted from codebase patterns. No code examples — see patterns.md.

## Data Fetching

| DO | DON'T |
|----|-------|
| Use `useQuery` / `useMutation` from TanStack Query for all server state | Use `useState + useEffect + axios` for data fetching |
| Call `queryClient.invalidateQueries()` after mutations | Manually update state after a mutation |
| Use `queryKeys.*` factory for all cache key references | Hardcode cache key arrays inline |
| Use `placeholderData: (prev) => prev` on list queries | Let lists flash empty on parameter change |
| Use `initializedRef` guard to init forms from query data | Initialize form in `useEffect` without guard (causes reset loops) |

## Permissions

| DO | DON'T |
|----|-------|
| Use `usePermissions()` for all role checks | Access `user.roles` directly |
| Wrap every protected page in `<PermissionGuard roles={[...]}>` | Rely only on middleware for client route protection |
| Use `canAccess(pathname)` from `usePermissions` in sidebar/navigation | Hardcode role checks inline in navigation |
| Derive sidebar items from `ROUTE_PERMISSIONS` map | Maintain a separate navigation role map |

## API / Services

| DO | DON'T |
|----|-------|
| Extend `CrudService<T, P>` and implement `baseUrl()` | Call `api.get/post/put` directly in components |
| Override `update()` with `api.put()` when backend expects PUT (not PATCH) | Assume `CrudService.update()` (PATCH) works for all entities |
| Use `updateFormData()` for multipart/form-data uploads | Set Content-Type manually on file upload requests |
| Use `storageUrl(path)` for all backend storage image paths | Interpolate `NEXT_PUBLIC_STORAGE_URL` directly |
| Use `useErrorHandler().handleError(err)` in all catch blocks | Show raw error messages to users |

## UI / Theming

| DO | DON'T |
|----|-------|
| Use semantic CSS variable tokens (`text-text`, `bg-panel`, `border-border`, etc.) | Use hardcoded Tailwind color classes (`text-gray-900`, `bg-white`) |
| Use `cn(...classes)` from `src/utils/helpers.ts` for conditional class merging | Use string concatenation for conditional Tailwind classes |
| Use `formatDate(value)` from `src/utils/helpers.ts` | Call `new Intl.DateTimeFormat` or `new Date().toLocaleDateString` inline |
| Use companion enum label maps (e.g. `PERSON_TYPE_LABELS`) | Hardcode Portuguese display strings inline |

## Forms

| DO | DON'T |
|----|-------|
| Use `validate()` function returning boolean before submit | Submit without client-side validation |
| Clear individual field error on change: `setErrors(p => ({ ...p, field: undefined }))` | Clear all errors at once on any change |
| Use `submitting` boolean state to disable submit button during request | Allow double-submit on slow connections |
| Use `confirmDelete` boolean state for delete confirmations | Show browser `confirm()` dialogs |

## Hierarchy Cascade

| DO | DON'T |
|----|-------|
| Use `useHierarchyCascade({ dioceseId, sectorId })` for diocese→sector→parish selectors | Fetch hierarchy data with `useState + useEffect` |
| Reset `page` to `1` when filters or `debouncedSearch` change | Keep page when filters change |
| Use `useDebounce(search, 400)` before adding `search` to query params | Pass search string directly to query params |

## Auth

| DO | DON'T |
|----|-------|
| Use `useAuth()` hook for token and user access | Read `localStorage.getItem('authToken')` directly in components |
| Sync auth cookie via `syncAuthCookie(token)` when token changes | Expect middleware to read from localStorage (it cannot) |
| Handle 401 in `useErrorHandler` by calling `logOut()` | Show error toast on 401 |
