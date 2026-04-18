import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import DioceseService from '@/services/api/DioceseService';

export function useDioceseList(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.dioceses.list(params ?? {}),
    queryFn: () => DioceseService.list({ per_page: 100, ...params }).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}

export function useDiocese(id: string) {
  return useQuery({
    queryKey: queryKeys.dioceses.detail(id),
    queryFn: () => DioceseService.search(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteDiocese() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DioceseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dioceses.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
    },
  });
}

// Re-export hierarchy key for invalidation convenience
const { hierarchy: hierarchyKeys } = queryKeys;
export { hierarchyKeys };
