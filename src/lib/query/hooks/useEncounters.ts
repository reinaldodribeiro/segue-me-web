import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import EncounterService from '@/services/api/EncounterService';
import { EncounterPayload } from '@/interfaces/Encounter';

export function useEncounterList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.encounters.list(params),
    queryFn: () => EncounterService.paginated(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}

export function useEncounter(id: string) {
  return useQuery({
    queryKey: queryKeys.encounters.detail(id),
    queryFn: () => EncounterService.search(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useEncounterSummary(id: string) {
  return useQuery({
    queryKey: queryKeys.encounters.summary(id),
    queryFn: () => EncounterService.summary(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useEncounterTeams(id: string) {
  return useQuery({
    queryKey: queryKeys.encounters.teams(id),
    queryFn: () => EncounterService.getTeams(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export interface AvailablePeopleFilters {
  search?: string;
  never_in_movement?: boolean;
  priority?: boolean;
}

export function useEncounterAvailablePeople(id: string, filters?: AvailablePeopleFilters) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.encounters.availablePeople(id), filters ?? {}],
    queryFn: async ({ pageParam }) => {
      const response = await EncounterService.availablePeople(id, {
        page: pageParam,
        per_page: 15,
        ...filters,
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.current_page < lastPage.meta.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!id,
  });
}

export function useEncounterParticipants(id: string) {
  return useQuery({
    queryKey: queryKeys.encounters.participants(id),
    queryFn: () => EncounterService.listParticipants(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useEncounterPreviousParticipants(id: string) {
  return useQuery({
    queryKey: queryKeys.encounters.previousParticipants(id),
    queryFn: () => EncounterService.previousParticipants(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteEncounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => EncounterService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.all });
    },
  });
}

export function useUpdateEncounter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EncounterPayload> & { status?: string } }) =>
      EncounterService.put(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.encounters.lists() });
    },
  });
}
