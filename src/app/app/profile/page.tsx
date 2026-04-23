'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import Profile from '@/features/Profile';

export default function ProfilePage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']}>
      <Profile />
    </PermissionGuard>
  );
}
