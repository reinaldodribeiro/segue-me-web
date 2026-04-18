'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import PeopleList from '@/features/People/List';

export default function PeoplePage() {
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <PeopleList />
    </PermissionGuard>
  );
}
