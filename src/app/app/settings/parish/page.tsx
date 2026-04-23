'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import ParishSettings from '@/features/Parishes/Settings';

export default function ParishSettingsPage() {
  return (
    <PermissionGuard roles={['parish_admin']}>
      <ParishSettings />
    </PermissionGuard>
  );
}
