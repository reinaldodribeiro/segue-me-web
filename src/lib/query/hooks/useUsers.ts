import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../keys';
import AdminUserService from '@/services/api/AdminUserService';
import { UserPayload } from '@/interfaces/User';

export function useUserList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => AdminUserService.list(params).then((r) => ({
      data: r.data.data,
      meta: r.data.meta,
    })),
    placeholderData: (prev) => prev,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => AdminUserService.show(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminUserService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => AdminUserService.toggleActive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserPayload> }) =>
      AdminUserService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
