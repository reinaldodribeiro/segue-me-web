'use client';

import { use } from 'react';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import PersonDetail from '@/features/People/Detail';

export default function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <PersonDetail id={id} />
    </PermissionGuard>
  );
}
