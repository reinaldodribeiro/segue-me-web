import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useEncounterAvailablePeople(id: string, params?: Record<string, unknown>) {
  return useQuery({
    queryKey: [...queryKeys.encounters.availablePeople(id), params ?? {}],
    queryFn: () => EncounterService.availablePeople(id, params).then((r) => r.data.data),
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
