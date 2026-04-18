import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import AiApiLogService from '@/services/api/AiApiLogService';

export function useAiApiLogList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.aiApiLogs.list(params),
    queryFn: () => AiApiLogService.list(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
  });
}

export function useAiApiLogStats(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...queryKeys.aiApiLogs.all, 'stats', params ?? {}],
    queryFn: () => AiApiLogService.stats(params).then((r) => r.data),
  });
}
