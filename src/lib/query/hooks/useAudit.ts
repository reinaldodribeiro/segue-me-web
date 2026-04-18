import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import AuditService from '@/services/api/AuditService';

export function useAuditList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.audit.list(params),
    queryFn: () => AuditService.list(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}
