<!-- mustard:generated at:2026-04-01T20:20:04Z role:ui -->

# Patterns: Frontend (ui)

> Recurring implementation patterns with concrete file references.

## 1. Page Wrapper Pattern

Every protected page is a thin wrapper applying `PermissionGuard`:
```tsx
'use client';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import PeopleList from '@/features/People/List';
export default function Page() {
  return <PermissionGuard roles={['parish_admin', 'coordinator']}><PeopleList /></PermissionGuard>;
}
```
Ref: `src/app/app/people/page.tsx`

## 2. CrudService Extension

Extend `CrudService<T, P>` and implement `baseUrl()`. Override `update()` with `api.put()` when backend expects PUT:
```ts
class PersonService extends CrudService<Person, PersonPayload> {
  protected baseUrl() { return 'people'; }
  put(id: string, data: Partial<PersonPayload>) { return api.put(`people/${id}`, data); }
}
```
Ref: `src/services/api/PersonService.ts`, `src/services/api/CrudService.ts`

## 3. TanStack Query Hook

One hook file per entity in `src/lib/query/hooks/`. Keys from `queryKeys` factory. Use `placeholderData: (prev) => prev` on list queries:
```ts
export function usePersonList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.persons.list(params),
    queryFn: () => PersonService.paginated(params).then((r) => ({ data: r.data.data, meta: r.data.meta })),
    placeholderData: (prev) => prev,
  });
}
```
Ref: `src/lib/query/hooks/usePersons.ts`, `src/lib/query/keys.ts`

## 4. Mutation + Invalidate Pattern

After mutations, invalidate cache keys — never manually set state:
```ts
const queryClient = useQueryClient();
return useMutation({
  mutationFn: (id: string) => PersonService.delete(id),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.persons.all }),
});
```
Ref: `src/lib/query/hooks/usePersons.ts`

## 5. Form Initialization Guard (initializedRef)

Prevent re-initializing form from cache after mutation:
```ts
const initializedRef = useRef<string | null>(null);
useEffect(() => {
  if (!data || initializedRef.current === id) return;
  initializedRef.current = id;
  setName(data.name);
}, [data, id]);
```
Ref: `src/features/People/Detail/index.tsx` (pattern from CLAUDE.md)

## 6. Debounced Search + Page Reset

Use `useDebounce(search, 400)`. Reset `page` to `1` on filter change:
```ts
const debouncedSearch = useDebounce(search, 400);
const listParams: Record<string, unknown> = { per_page: 30, page };
if (debouncedSearch) listParams.search = debouncedSearch;
```
Ref: `src/features/People/List/index.tsx`

## 7. Hierarchy Cascade Selectors

Diocese → Sector → Parish cascade via `useHierarchyCascade` hook:
```ts
const { dioceses, sectors, parishes } = useHierarchyCascade({ dioceseId, sectorId });
```
Lower-level selectors are disabled until parent is selected. Ref: `src/hooks/useHierarchyCascade.ts`

## 8. Error Handling Pattern

Use `useErrorHandler().handleError()` in catch blocks — maps HTTP status codes to toast messages:
```ts
const { handleError } = useErrorHandler();
try { await PersonService.save(payload); }
catch (err) { handleError(err, 'NewPerson'); }
```
Ref: `src/hooks/useErrorHandler.ts`

## 9. Permission Hook Usage

Always use `usePermissions()` — never access `user.roles` directly:
```ts
const { isSuperAdmin, hasAnyRole, canAccess } = usePermissions();
```
Ref: `src/hooks/usePermissions.ts`, `src/constants/permissions.ts`

## 10. Enum Label Maps

Always use companion label maps for display — never hardcode display strings:
```ts
import { PERSON_TYPE_LABELS } from '@/interfaces/Person';
<span>{PERSON_TYPE_LABELS[person.type]}</span>
```
Ref: `src/interfaces/Person.ts`

## 11. Polling Pattern (Import Status)

`refetchInterval` returns `false` when done/failed to stop polling:
```ts
return useQuery({
  queryKey: queryKeys.importStatus.byKey(cacheKey!),
  queryFn: () => PersonService.importStatus(cacheKey!).then((r) => r.data),
  enabled: !!cacheKey,
  refetchInterval: (query) => {
    const status = query.state.data?.status;
    if (status === 'done' || status === 'failed') return false;
    return 2000;
  },
});
```
Ref: `src/lib/query/hooks/usePersons.ts`

## 12. Duplicate Detection (409 Conflict)

POST returns 409 with `{ data: { duplicates: [...] } }`. Show warning modal; pass `force: true` to bypass:
```ts
} catch (err) {
  if ((err as { status?: number })?.status === 409) setDuplicates(data.duplicates);
}
```
Ref: `src/features/People/New/index.tsx`
