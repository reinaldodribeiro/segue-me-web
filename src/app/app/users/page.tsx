'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import UsersList from '@/features/Users/List';

export default function UsersPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin']}>
      <UsersList />
    </PermissionGuard>
  );
}
