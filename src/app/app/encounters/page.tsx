'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import EncountersList from '@/features/Encounters/List';

export default function EncountersPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator']}>
      <EncountersList />
    </PermissionGuard>
  );
}
