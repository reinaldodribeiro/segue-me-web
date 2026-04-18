import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import EncounterService from '@/services/api/EncounterService';
import PersonService from '@/services/api/PersonService';
import type { DashboardStats } from '@/features/Dashboard/types';

interface DashboardStatsParams {
  parishId?: string;
  isAboveParish: boolean;
  hasPersonAccess: boolean;
}

export function useDashboardStats({ parishId, isAboveParish, hasPersonAccess }: DashboardStatsParams) {
  const params: Record<string, unknown> = { parishId, isAboveParish, hasPersonAccess };

  return useQuery({
    queryKey: queryKeys.dashboard.stats(params),
    queryFn: async (): Promise<DashboardStats> => {
      const encounterParams: Record<string, unknown> = { per_page: 50 };
      if (isAboveParish && parishId) encounterParams.parish_id = parishId;

      const peoplePromise = hasPersonAccess
        ? PersonService.paginated({
            per_page: 100,
            ...(isAboveParish && parishId ? { parish_id: parishId } : {}),
          })
        : Promise.resolve(null);

      const [encRes, pplRes] = await Promise.all([
        EncounterService.paginated(encounterParams),
        peoplePromise,
      ]);

      const sample = pplRes?.data.data ?? [];
      const avgScore = sample.length
        ? Math.round(sample.reduce((s, p) => s + p.engagement_score, 0) / sample.length)
        : 0;

      return {
        totalPeople: pplRes?.data.meta.total ?? 0,
        peopleSample: sample,
        avgScore,
        recentEncounters: encRes.data.data,
        totalEncounters: encRes.data.meta.total,
      };
    },
  });
}
