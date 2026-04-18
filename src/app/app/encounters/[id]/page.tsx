'use client';

import { use } from 'react';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import EncounterDetail from '@/features/Encounters/Detail';

export default function EncounterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']}>
      <EncounterDetail id={id} />
    </PermissionGuard>
  );
}
