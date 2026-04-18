import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import MovementService from '@/services/api/MovementService';
import { MovementPayload } from '@/interfaces/Movement';

export function useMovementList(params: Record<string, unknown>, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.movements.list(params),
    queryFn: () => MovementService.list(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
    enabled: options?.enabled ?? true,
  });
}

export function useMovement(id: string) {
  return useQuery({
    queryKey: queryKeys.movements.detail(id),
    queryFn: () => MovementService.search(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useMovementTeams(id: string) {
  return useQuery({
    queryKey: queryKeys.movements.teams(id),
    queryFn: () => MovementService.getTeams(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => MovementService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.all });
    },
  });
}

export function useUpdateMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MovementPayload> }) =>
      MovementService.put(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.movements.lists() });
    },
  });
}
