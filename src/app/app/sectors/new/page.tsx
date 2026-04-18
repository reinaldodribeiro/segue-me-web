'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewSector from '@/features/Sectors/New';

export default function NewSectorPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin']}>
      <NewSector />
    </PermissionGuard>
  );
}
