'use client';

import { use } from 'react';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import MovementDetail from '@/features/Movements/Detail';

export default function MovementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin']}>
      <MovementDetail id={id} />
    </PermissionGuard>
  );
}
