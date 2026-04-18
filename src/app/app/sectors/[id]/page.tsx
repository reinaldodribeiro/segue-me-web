'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import SectorDetail from '@/features/Sectors/Detail';

export default function SectorDetailPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin']}>
      <SectorDetail />
    </PermissionGuard>
  );
}
