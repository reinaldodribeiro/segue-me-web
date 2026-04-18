---
name: frontend-query-hooks
description: "Pattern for TanStack Query v5 hooks in the segue-me frontend. Covers useQuery for reads,
  useMutation for writes, query key factory usage, polling, and the initializedRef guard for form init.
  Use when adding data fetching, creating a new query hook, wiring a mutation, invalidating cache,
  or the user says 'fetch data', 'load from API', 'save changes', 'refresh after save', 'polling'."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# TanStack Query Hook Pattern

All server state uses `@tanstack/react-query` v5. Query hooks live in `src/lib/query/hooks/use{Entity}.ts`. Keys come from the `queryKeys` factory in `src/lib/query/keys.ts`.

## Pattern

Rules:
- `placeholderData: (prev) => prev` on all list queries (prevents flash to empty)
- After mutations: call `queryClient.invalidateQueries()` -- never manually update state
- `enabled: !!id` guards detail queries against empty IDs
- Default config: `staleTime: 2min`, `gcTime: 10min`, `retry: 1` (from `client.ts`)
- Polling: `refetchInterval` returns `false` when status is terminal
- Hierarchy queries use `staleTime: 5min` for longer cache

## Example

```ts
// Read list with pagination
export function usePersonList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.persons.list(params),
    queryFn: () => PersonService.paginated(params).then((r) => ({ data: r.data.data, meta: r.data.meta })),
    placeholderData: (prev) => prev,
  });
}

// Mutation + invalidate both detail and list
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
Ref: `src/lib/query/hooks/usePersons.ts`

## References

For full code examples with variants:
-> Read `references/examples.md`
