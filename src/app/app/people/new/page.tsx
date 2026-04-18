'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewPerson from '@/features/People/New';

export default function NewPersonPage() {
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <NewPerson />
    </PermissionGuard>
  );
}
