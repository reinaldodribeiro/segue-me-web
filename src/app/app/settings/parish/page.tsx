'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';

// Roles: parish_admin
// API: GET /parishes/{parish} · PUT /parishes/{parish}
//      POST /parishes/{parish}/logo
//      GET /parishes/{parish}/skills · POST /parishes/{parish}/skills · DELETE /parishes/{parish}/skills
export default function ParishSettingsPage() {
  return (
    <PermissionGuard roles={['parish_admin']}>
      <div>TODO: Configurações da paróquia (logo, cores, skills)</div>
    </PermissionGuard>
  );
}
