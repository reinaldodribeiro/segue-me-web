'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewDiocese from '@/features/Dioceses/New';

export default function NewDiocesePage() {
  return (
    <PermissionGuard roles={['super_admin']}>
      <NewDiocese />
    </PermissionGuard>
  );
}
