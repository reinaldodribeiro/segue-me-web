'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import NewEncounter from '@/features/Encounters/New';

export default function NewEncounterPage() {
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <NewEncounter />
    </PermissionGuard>
  );
}
