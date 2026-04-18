'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewUser from '@/features/Users/New';

export default function NewUserPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin']}>
      <NewUser />
    </PermissionGuard>
  );
}
