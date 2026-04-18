'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewMovement from '@/features/Movements/New';

export default function NewMovementPage() {
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin']}>
      <NewMovement />
    </PermissionGuard>
  );
}
