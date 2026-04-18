'use client';

import PermissionGuard from '@/components/Auth/PermissionGuard';
import DioceseDetail from '@/features/Dioceses/Detail';

export default function DioceseDetailPage() {
  return (
    <PermissionGuard roles={['super_admin']}>
      <DioceseDetail />
    </PermissionGuard>
  );
}
