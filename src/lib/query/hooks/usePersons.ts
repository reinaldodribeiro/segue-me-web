import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import PersonService from '@/services/api/PersonService';
import { PersonPayload } from '@/interfaces/Person';
import api from '@/config/api';

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

export function usePerson(id: string) {
  return useQuery({
    queryKey: queryKeys.persons.detail(id),
    queryFn: () => PersonService.search(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function usePersonHistory(id: string) {
  return useQuery({
    queryKey: queryKeys.persons.history(id),
    queryFn: () => PersonService.history(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function usePersonTeamExperiences(id: string) {
  return useQuery({
    queryKey: queryKeys.persons.teamExperiences(id),
    queryFn: () => PersonService.teamExperiences(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useParishSkills(parishId: string | null) {
  return useQuery({
    queryKey: parishId ? queryKeys.parishes.skills(parishId) : ['parishes', 'skills', 'none'],
    queryFn: () => api.get<{ data: string[] }>(`parishes/${parishId}/skills`).then((r) => r.data.data ?? []),
    enabled: !!parishId,
  });
}

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

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PersonService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.persons.all });
    },
  });
}

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
