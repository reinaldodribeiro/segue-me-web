'use client';

import { use } from 'react';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import EncounterTeams from '@/features/Encounters/Teams';

export default function EncounterTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <EncounterTeams encounterId={id} />
    </PermissionGuard>
  );
}
