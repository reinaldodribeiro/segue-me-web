import { useQueries, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import DioceseService from '@/services/api/DioceseService';
import SectorService from '@/services/api/SectorService';
import ParishService from '@/services/api/ParishService';

const HIERARCHY_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useHierarchyDioceses(enabled = true) {
  return useQuery({
    queryKey: queryKeys.hierarchy.dioceses(),
    queryFn: () => DioceseService.list({ per_page: 200 }).then((r) => r.data.data),
    staleTime: HIERARCHY_STALE_TIME,
    enabled,
  });
}

export function useHierarchySectors(dioceseId: string) {
  return useQuery({
    queryKey: queryKeys.hierarchy.sectors(dioceseId),
    queryFn: () => SectorService.listByDiocese(dioceseId, { per_page: 200 }).then((r) => r.data.data),
    staleTime: HIERARCHY_STALE_TIME,
    enabled: !!dioceseId,
  });
}

export function useHierarchyParishes(sectorId: string) {
  return useQuery({
    queryKey: queryKeys.hierarchy.parishes(sectorId),
    queryFn: () => ParishService.listBySector(sectorId, { per_page: 200 }).then((r) => r.data.data),
    staleTime: HIERARCHY_STALE_TIME,
    enabled: !!sectorId,
  });
}

/**
 * Loads parishes for multiple sectors in parallel.
 * Used for diocese-wide parish enumeration in aggregate views.
 */
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
