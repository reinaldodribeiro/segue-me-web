<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Recipes: Frontend (ui)

> Step-by-step implementation recipes with file hierarchies and pattern references.

## Recipe: New Component (SafeFC)

### Steps
1. Create folder `src/components/{Name}/`
2. Add `types.ts` with props interface
3. Add `index.tsx` using SafeFC pattern (see Pattern #1)
4. Use semantic tokens (`text-text`, `bg-panel`, etc.) -- never hardcoded colors
5. Use `cn()` for conditional class merging
6. Accept common props: `className?`, `disabled?`, `children?`

### Template
```tsx
// src/components/{Name}/index.tsx
import { {Name}Props } from './types';

const {Name}: SafeFC<{Name}Props> = ({ ...props }) => {
  return <div>...</div>;
};

export default {Name};
```
Ref: `src/components/SectionCard/index.tsx`

---

## Recipe: New Context + Hook

### Steps
1. Create context in `src/context/{Name}Context.tsx`
2. Export `interface {Name}ContextData` with all public fields and functions
3. Export `const {Name}Context = createContext<{Name}ContextData>(...)` 
4. Export `{Name}Provider` with `useCallback` on all functions and `useMemo` on `valueData`
5. Create hook in `src/hooks/use{Name}.ts` (see Pattern #3)
6. Hook must have explicit return type: `export function use{Name}(): {Name}ContextData`

### Template (context)
```tsx
export interface XContextData { value: string; setValue: (v: string) => void; }
export const XContext = createContext<XContextData | undefined>(undefined);
export const XProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState('');
  const setValueCb = useCallback((v: string) => setValue(v), []);
  const valueData: XContextData = useMemo(() => ({ value, setValue: setValueCb }), [value, setValueCb]);
  return <XContext.Provider value={valueData}>{children}</XContext.Provider>;
};
```

### Template (hook)
```tsx
export function useX(): XContextData {
  const context = useContext(XContext);
  if (!context) throw new Error('useX must be used within a XProvider');
  return context;
}
```
Ref: `src/context/ToastContext.tsx`, `src/hooks/useToast.ts`

---

## Recipe: New CRUD Entity (Full)

### Steps
1. Add TypeScript interface in `src/interfaces/{Name}.ts`
2. Add service extending CrudService in `src/services/api/{Name}Service.ts`
3. Add query keys block in `src/lib/query/keys.ts`
4. Add query hooks in `src/lib/query/hooks/use{Names}.ts`
5. Add feature folder: `src/features/{Name}/List/`, `New/`, `Detail/`
6. All feature components use `const X: SafeFC = () => {}` + `export default X`
7. Add page wrappers in `src/app/app/{route}/page.tsx`
8. Add route permissions in `src/constants/permissions.ts`
9. Run type-check: `npx tsc --noEmit`

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

Ref: `src/services/api/PersonService.ts`, `src/lib/query/hooks/usePersons.ts`, `src/features/People/List/index.tsx`

---

## Recipe: Add Field to Existing Entity

### Steps
1. Update interface in `src/interfaces/{Name}.ts`
2. Update service payload type (if field is writable)
3. Update `New/index.tsx` form state + validation
4. Update `Detail/index.tsx` form state + `initializedRef` init block
5. Update `List/index.tsx` table column (if visible in list)
6. Run type-check: `npx tsc --noEmit`

Ref: `src/interfaces/Person.ts`, `src/features/People/New/index.tsx`

---

## Recipe: New Route with Hierarchy Filter

### Steps
1. Add query hook with hierarchy cascade in feature component
2. Import `useHierarchyCascade` or use raw hierarchy hooks
3. Add cascade selectors (Diocese -> Sector -> Parish)
4. Reset `page` to `1` on filter change
5. Add route permission in `src/constants/permissions.ts`

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

Ref: `src/services/api/PersonService.ts` (`importSpreadsheet`), `src/lib/query/hooks/usePersons.ts` (`useImportStatus`)

---

## Recipe: New TanStack Query Hook

### Steps
1. Add query key(s) in `src/lib/query/keys.ts`
2. Create hook file in `src/lib/query/hooks/use{Name}.ts`
3. For reads: `useQuery` with `queryKey`, `queryFn`, `enabled`
4. For writes: `useMutation` with `mutationFn` + `onSuccess` invalidation
5. For lists: add `placeholderData: (prev) => prev`

Ref: `src/lib/query/hooks/usePersons.ts`, `src/lib/query/keys.ts`

---

## Recipe: Add Service Method to Existing Service

### Steps
1. Add method to the service class in `src/services/api/{Name}Service.ts`
2. Use `api.get/post/put/patch/delete` with correct endpoint
3. Type the return: `Promise<AxiosResponse<{ data: T }>>`
4. For file uploads: use `FormData` and `api.post` (no manual Content-Type)
5. For blob downloads: use `{ responseType: 'blob' }` and create download link
6. Add JSDoc comment with HTTP method and endpoint path

Ref: `src/services/api/EncounterService.ts`
