import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import { aggregateEngagement } from '@/utils/aggregateEngagement';

export function useEngagementReport(parishIds: string[]) {
  const sortedIds = [...parishIds].sort();
  return useQuery({
    queryKey: queryKeys.engagement.report(sortedIds),
    queryFn: () => aggregateEngagement(sortedIds),
    enabled: sortedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
