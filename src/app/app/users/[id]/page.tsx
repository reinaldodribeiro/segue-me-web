'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import UserDetail from '@/features/Users/Detail';

export default function UserDetailPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin']}>
      <UserDetail />
    </PermissionGuard>
  );
}
