---
name: frontend-hierarchy-cascade
description: "Pattern for diocese -> sector -> parish cascade selectors in the segue-me frontend.
  Covers useHierarchyCascade hook, dependent query loading, role-based starting point, and parallel loading.
  Use when building a form or filter with hierarchical location selectors, loading entities by hierarchy,
  or the user says 'add diocese selector', 'filter by parish', 'cascade dropdown', 'sector filter',
  'hierarchy select', 'load sectors for diocese'."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Hierarchy Cascade Pattern

The backend has no flat `/parishes` endpoint -- lists are loaded by traversing diocese -> sector -> parish. `useHierarchyCascade` wraps three React Query hierarchy hooks with role-aware loading.

## Pattern

Key rules:
- `super_admin` sees all dioceses; other roles have a fixed diocese
- Sectors load only when `dioceseId` is set; parishes only when `sectorId` is set
- Pass `loadSectors: false` or `loadParishes: false` to stop cascade early
- Results cached with 5min `staleTime` via React Query
- For loading parishes across multiple sectors, use `useHierarchyParishesForSectors(sectorIds)`

## Performance Note

For super_admin, the cascade requires sequential API calls (diocese -> sector -> parish). The 5min cache mitigates repeated loading, but first load can be slow with many dioceses. Consider the scalability when the hierarchy grows.

## Example

```ts
const { dioceses, sectors, parishes, loadingDioceses } = useHierarchyCascade({
  dioceseId,
  sectorId,
  loadSectors: true,
  loadParishes: true,
});
```
Ref: `src/hooks/useHierarchyCascade.ts`

## References

For full code examples with variants:
-> Read `references/examples.md`
