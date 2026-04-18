'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import DiocesesList from '@/features/Dioceses/List';

export default function DiocesesPage() {
  return (
    <PermissionGuard roles={['super_admin']}>
      <DiocesesList />
    </PermissionGuard>
  );
}
