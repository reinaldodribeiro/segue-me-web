'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import Reports from '@/features/Reports';

export default function ReportsPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']}>
      <Reports />
    </PermissionGuard>
  );
}
