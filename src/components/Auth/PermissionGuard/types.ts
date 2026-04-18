import { UserRole } from '@/types/roles';

export interface PermissionGuardProps {
  /** Roles that are allowed to see this content. */
  roles: UserRole[];
  children: React.ReactNode;
  /**
   * Where to redirect if the user lacks the required role.
   * Defaults to '/app' (dashboard).
   */
  redirectTo?: string;
}
