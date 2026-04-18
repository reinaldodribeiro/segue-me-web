<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Recipes: Frontend (ui)

> Step-by-step implementation recipes with file hierarchies and pattern references.

## Recipe: New CRUD Entity (Full)

### Steps
1. Add TypeScript interface in `src/interfaces/{Name}.ts`
2. Add service extending CrudService in `src/services/api/{Name}Service.ts`
3. Add query keys block in `src/lib/query/keys.ts`
4. Add query hooks in `src/lib/query/hooks/use{Names}.ts`
5. Add feature folder: `src/features/{Name}/List/`, `New/`, `Detail/`
6. Add page wrappers in `src/app/app/{route}/page.tsx`
7. Add route permissions in `src/constants/permissions.ts`
8. Run type-check: `npx tsc --noEmit`

### File hierarchy
| Level | File | Depends on |
|-------|------|-----------|
| 1 | `interfaces/{Name}.ts` | -- |
| 2 | `services/api/{Name}Service.ts` | interfaces |
| 3 | `lib/query/keys.ts` (add entry) | -- |
| 4 | `lib/query/hooks/use{Names}.ts` | service, keys |
| 5 | `features/{Name}/List/index.tsx` | query hooks |
| 5 | `features/{Name}/New/index.tsx` | service, hooks |
| 5 | `features/{Name}/Detail/index.tsx` | query hooks |
| 6 | `app/app/{route}/page.tsx` | feature components |
| 6 | `constants/permissions.ts` (add entries) | -- |

### Reference module: People
Ref: `src/services/api/PersonService.ts`, `src/lib/query/hooks/usePersons.ts`, `src/features/People/List/index.tsx`, `src/app/app/people/page.tsx`, `src/constants/permissions.ts`

---

## Recipe: Add Field to Existing Entity

### Steps
1. Update interface in `src/interfaces/{Name}.ts`
2. Update service payload type (if field is writable)
3. Update `New/index.tsx` form state + validation
4. Update `Detail/index.tsx` form state + `initializedRef` init block
5. Update `List/index.tsx` table column (if visible in list)
6. Run type-check: `npx tsc --noEmit`

Ref: `src/interfaces/Person.ts`, `src/features/People/New/index.tsx`, `src/features/People/Detail/index.tsx`

---

## Recipe: New Route with Hierarchy Filter

### Steps
1. Add query hook with hierarchy cascade in feature component
2. Import `useHierarchyCascade` or use raw hierarchy hooks
3. Add cascade selectors (Diocese -> Sector -> Parish)
4. Reset `page` to `1` on filter change
5. Add route permission in `src/constants/permissions.ts`
6. Run type-check: `npx tsc --noEmit`

Ref: `src/features/People/List/index.tsx`, `src/hooks/useHierarchyCascade.ts`

---

## Recipe: Import Flow with Polling

### Steps
1. Add import service methods (multipart POST) to the entity service
2. Add `useImportStatus` polling hook (or reuse existing)
3. Add import UI component in `features/{Name}/Import/`
4. On upload success, store `cache_key` in state to start polling
5. Display progress bar; stop on `done` / `failed` status
6. Invalidate entity list queries on success
7. Run type-check: `npx tsc --noEmit`

Ref: `src/services/api/PersonService.ts` (`importSpreadsheet`, `importStatus`), `src/lib/query/hooks/usePersons.ts` (`useImportStatus`), `src/features/People/Import/`

---

## Recipe: New TanStack Query Hook

### Steps
1. Add query key(s) in `src/lib/query/keys.ts`
2. Create hook file in `src/lib/query/hooks/use{Name}.ts`
3. For reads: `useQuery` with `queryKey`, `queryFn`, `enabled`
4. For writes: `useMutation` with `mutationFn` + `onSuccess` invalidation
5. For lists: add `placeholderData: (prev) => prev`
6. Export from the hook file (no barrel export needed)

Ref: `src/lib/query/hooks/usePersons.ts`, `src/lib/query/keys.ts`

---

## Recipe: New Shared Component

### Steps
1. Create folder in `src/components/{Name}/`
2. Add `index.tsx` with component implementation
3. Add `types.ts` for props interface
4. Use semantic tokens (`text-text`, `bg-panel`, etc.) -- never hardcoded colors
5. Use `cn()` for conditional class merging
6. Accept common props: `className?`, `disabled?`, `children?`

Ref: `src/components/Button/`, `src/components/Input/`, `src/components/SectionCard/`

---

## Recipe: Add Service Method to Existing Service

### Steps
1. Add method to the service class in `src/services/api/{Name}Service.ts`
2. Use `api.get/post/put/patch/delete` with correct endpoint
3. Type the return: `Promise<AxiosResponse<{ data: T }>>`
4. For file uploads: use `FormData` and `api.post` (no manual Content-Type)
5. For blob downloads: use `{ responseType: 'blob' }` and create download link
6. Add JSDoc comment with HTTP method and endpoint path

Ref: `src/services/api/EncounterService.ts` (comprehensive example with many custom methods)
