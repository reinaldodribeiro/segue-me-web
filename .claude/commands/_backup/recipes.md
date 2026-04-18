<!-- mustard:generated at:2026-04-01T20:20:04Z role:ui -->

# Recipes: Frontend (ui)

> Implementation index for new features. Hierarchy from actual import chains.

## Recipe: New CRUD Entity (Full)

### Steps
1. Add TypeScript interface → `src/interfaces/{Name}.ts`
2. Add service extending CrudService → `src/services/api/{Name}Service.ts`
3. Add query keys → `src/lib/query/keys.ts` (add `{names}` block)
4. Add query hooks → `src/lib/query/hooks/use{Names}.ts` → `patterns.md` §3, §4
5. Add feature folder → `src/features/{Name}/List/`, `New/`, `Detail/`
6. Add page wrappers → `src/app/app/{route}/page.tsx` → `patterns.md` §1
7. Add route permissions → `src/constants/permissions.ts`
8. Run type-check: `npx tsc --noEmit`

### Reference module: People
### Reference files: `src/services/api/PersonService.ts`, `src/lib/query/hooks/usePersons.ts`, `src/features/People/List/index.tsx`, `src/app/app/people/page.tsx`, `src/constants/permissions.ts`

### Task splits
- **Types + Service** (steps 1-2): Patterns: `patterns.md` §2 | Depends on: none
- **Query layer** (steps 3-4): Patterns: `patterns.md` §3, §4 | Depends on: Types + Service
- **UI + Pages** (steps 5-7): Patterns: `patterns.md` §1, §6, §9 | Depends on: Query layer
- **Validation** (step 8): Depends on: UI + Pages

### File hierarchy
| Level | Component | Depends on |
|-------|-----------|-----------|
| 1 | `interfaces/{Name}.ts` | — |
| 2 | `services/api/{Name}Service.ts` | interfaces |
| 3 | `lib/query/keys.ts` (add entry) | — |
| 4 | `lib/query/hooks/use{Names}.ts` | service, keys |
| 5 | `features/{Name}/List/index.tsx` | query hooks |
| 5 | `features/{Name}/New/index.tsx` | service, hooks |
| 5 | `features/{Name}/Detail/index.tsx` | query hooks |
| 6 | `app/app/{route}/page.tsx` | feature components |
| 6 | `constants/permissions.ts` (add entries) | — |
| 7 | type-check | all |

---

## Recipe: Add Field to Existing Entity

### Steps
1. Update interface → `src/interfaces/{Name}.ts`
2. Update service payload type (if needed)
3. Update `New/index.tsx` form state + validation → `patterns.md` §5 form pattern
4. Update `Detail/index.tsx` form state + `initializedRef` init → `patterns.md` §5
5. Update `List/index.tsx` table column (if visible in list)
6. Run type-check: `npx tsc --noEmit`

### Reference module: Person fields
### Reference files: `src/interfaces/Person.ts`, `src/features/People/New/index.tsx`

### Task splits
- **Types** (step 1-2): Depends on: none
- **UI update** (steps 3-5): Patterns: `patterns.md` §5 | Depends on: Types

---

## Recipe: New Route with Hierarchy Filter

### Steps
1. Add query hook with hierarchy params → `patterns.md` §7
2. Add `useHierarchyCascade` in list component
3. Add cascade selectors (Diocese → Sector → Parish)
4. Reset `page` to `1` on filter change → `patterns.md` §6
5. Add route permission entry → `src/constants/permissions.ts`
6. Run type-check: `npx tsc --noEmit`

### Reference files: `src/features/People/List/index.tsx`, `src/hooks/useHierarchyCascade.ts`

### File hierarchy
| Level | Component | Depends on |
|-------|-----------|-----------|
| 1 | `hooks/useHierarchyCascade.ts` | query hooks |
| 2 | feature List component | useHierarchyCascade |
| 3 | `constants/permissions.ts` | — |
| 4 | type-check | all |

---

## Recipe: Import Flow with Polling

### Steps
1. Add import service methods (multipart POST) → `patterns.md` §2
2. Add `useImportStatus` polling hook → `patterns.md` §11
3. Add import UI component in `features/{Name}/Import/`
4. Trigger polling by storing `cache_key` in state after upload
5. Display progress; stop on `done` / `failed`
6. Run type-check: `npx tsc --noEmit`

### Reference files: `src/services/api/PersonService.ts`, `src/lib/query/hooks/usePersons.ts` (useImportStatus), `src/features/People/Import/`
