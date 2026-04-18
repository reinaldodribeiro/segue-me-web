'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import ParishesList from '@/features/Parishes/List';

export default function ParishesPage() {
  return (
    <PermissionGuard roles={['super_admin', 'diocese_admin', 'sector_admin']}>
      <ParishesList />
    </PermissionGuard>
  );
}
