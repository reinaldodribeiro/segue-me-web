import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import SectorService from '@/services/api/SectorService';

export function useSectorList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.sectors.byDiocese(
      (params.diocese_id as string | undefined) ?? '',
      params,
    ),
    queryFn: () => SectorService.list(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}

export function useSector(id: string) {
  return useQuery({
    queryKey: queryKeys.sectors.detail(id),
    queryFn: () => SectorService.show(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteSector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SectorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sectors.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
    },
  });
}
