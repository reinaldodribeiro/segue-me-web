import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import ParishService from '@/services/api/ParishService';
import { ParishPayload } from '@/interfaces/Parish';

export function useParishList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.parishes.list(params),
    queryFn: () => ParishService.list(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}

export function useParish(id: string) {
  return useQuery({
    queryKey: queryKeys.parishes.detail(id),
    queryFn: () => ParishService.search(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useParishSkills(id: string) {
  return useQuery({
    queryKey: queryKeys.parishes.skills(id),
    queryFn: () => ParishService.listSkills(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteParish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ParishService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
    },
  });
}

export function useUpdateParish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ParishPayload & { active: boolean }> }) =>
      ParishService.put(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.parishes.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
    },
  });
}
