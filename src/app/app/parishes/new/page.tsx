'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewParish from '@/features/Parishes/New';

export default function NewParishPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin']}>
      <NewParish />
    </PermissionGuard>
  );
}
