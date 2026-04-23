'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import Dashboard from '@/features/Dashboard';

export default function AppPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']}>
      <Dashboard />
    </PermissionGuard>
  );
}
