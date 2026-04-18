'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import SectorsList from '@/features/Sectors/List';

export default function SectorsPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin']}>
      <SectorsList />
    </PermissionGuard>
  );
}
