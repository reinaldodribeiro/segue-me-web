'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import AuditList from '@/features/Audit/List';

export default function AuditPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin']}>
      <AuditList />
    </PermissionGuard>
  );
}
