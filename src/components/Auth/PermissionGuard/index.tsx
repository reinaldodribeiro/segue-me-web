'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuardProps } from './types';

/**
 * Client-side role guard. Wraps any page or section that requires specific roles.
 *
 * Usage in a page:
 *   <PermissionGuard roles={['parish_admin']}>
 *     <MovementsPage />
 *   </PermissionGuard>
 *
 * For server-side enforcement, Next.js middleware handles basic auth checks.
 * Role-based enforcement lives here in the client layer because roles are
 * stored server-side and resolved after the initial auth token exchange.
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  roles,
  children,
  redirectTo = '/app',
}) => {
  const { hasAnyRole } = usePermissions();
  const router = useRouter();
  const allowed = hasAnyRole(roles);

  useEffect(() => {
    if (!allowed) {
      router.replace(redirectTo);
    }
  }, [allowed, redirectTo, router]);

  if (!allowed) return null;

  return <>{children}</>;
};

export default PermissionGuard;
