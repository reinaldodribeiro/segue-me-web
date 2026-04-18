<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Hierarchy Cascade Examples

## useHierarchyCascade hook signature
Ref: `src/hooks/useHierarchyCascade.ts`
```ts
const { dioceses, sectors, parishes, loadingDioceses, loadingSectors, loadingParishes } =
  useHierarchyCascade({
    dioceseId,           // currently selected diocese ID
    sectorId,            // currently selected sector ID
    loadSectors: true,   // false when sectors not needed
    loadParishes: true,  // false when parishes not needed
  });
```

## Direct query hooks (when cascade hook is not enough)
Ref: `src/lib/query/hooks/useHierarchy.ts`
```ts
const { data: dioceses = [] } = useHierarchyDioceses(isSuperAdmin);
const { data: sectors = [] } = useHierarchySectors(dioceseId);  // enabled when dioceseId truthy
const { data: parishes = [] } = useHierarchyParishes(sectorId); // enabled when sectorId truthy
```

## Cascade in People list filter (admin-only)
Ref: `src/features/People/List/index.tsx`
```ts
const isAdmin = isSuperAdmin || isDioceseAdmin;
const { data: dioceses = [] } = useHierarchyDioceses(isAdmin);
const { data: sectors = [] } = useHierarchySectors(isAdmin ? filterDiocese : '');
const { data: parishes = [] } = useHierarchyParishes(isAdmin ? filterSector : '');
// Non-admins skip hierarchy loading entirely
```

## Parallel loading for multiple sectors
Ref: `src/lib/query/hooks/useHierarchy.ts`
```ts
export function useHierarchyParishesForSectors(sectorIds: string[]) {
  return useQueries({
    queries: sectorIds.map((sectorId) => ({
      queryKey: queryKeys.hierarchy.parishes(sectorId),
      queryFn: () => ParishService.listBySector(sectorId, { per_page: 200 }).then((r) => r.data.data),
      staleTime: HIERARCHY_STALE_TIME,
    })),
    combine: (results) => ({
      data: results.flatMap((r) => r.data ?? []),
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}
```
