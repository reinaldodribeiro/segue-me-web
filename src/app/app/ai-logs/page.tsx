'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import AiLogsList from '@/features/AiLogs/List';

export default function AiLogsPage() {
  return (
    <PermissionGuard roles={['super_admin']}>
      <AiLogsList />
    </PermissionGuard>
  );
}
