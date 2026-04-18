'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import ParishDetail from '@/features/Parishes/Detail';

export default function ParishDetailPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin']}>
      <ParishDetail />
    </PermissionGuard>
  );
}
