<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Query Hook Examples

## List query with pagination placeholders
Ref: `src/lib/query/hooks/usePersons.ts`
```ts
export function usePersonList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.persons.list(params),
    queryFn: () => PersonService.paginated(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}
```

## Detail query with enabled guard
Ref: `src/lib/query/hooks/usePersons.ts`
```ts
export function usePerson(id: string) {
  return useQuery({
    queryKey: queryKeys.persons.detail(id),
    queryFn: () => PersonService.search(id).then((r) => r.data.data),
    enabled: !!id,
  });
}
```

## Mutation with dual invalidation (detail + lists)
Ref: `src/lib/query/hooks/usePersons.ts`
```ts
export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PersonPayload> }) =>
      PersonService.put(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.lists() });
    },
  });
}
```

## Polling query (stops on terminal state)
Ref: `src/lib/query/hooks/usePersons.ts`
```ts
export function useImportStatus(cacheKey: string | null) {
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
}
```

## Parallel queries (useQueries for multiple sectors)
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

## Query key factory structure
Ref: `src/lib/query/keys.ts`
```ts
persons: {
  all: ['persons'] as const,
  lists: () => [...queryKeys.persons.all, 'list'] as const,
  list: (filters) => [...queryKeys.persons.lists(), filters] as const,
  details: () => [...queryKeys.persons.all, 'detail'] as const,
  detail: (id) => [...queryKeys.persons.details(), id] as const,
}
```
