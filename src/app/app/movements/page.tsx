'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import MovementsList from '@/features/Movements/List';

export default function MovementsPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin']}>
      <MovementsList />
    </PermissionGuard>
  );
}
