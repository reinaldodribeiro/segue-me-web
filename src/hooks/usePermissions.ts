import { useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/roles";
import { getRoutePermission } from "@/constants/permissions";

export function usePermissions() {
  const { user } = useAuth();

  /**
   * Normalise roles to plain strings.
   * Spatie Permission can return either strings ("super_admin") or objects
   * ({ id, name, guard_name, ... }) depending on the API resource.
   * Memoized so that stable `hasRole`/`hasAnyRole` callbacks can be derived.
   */
  const userRoles = useMemo(
    () =>
      (user?.roles ?? []).map((r) =>
        typeof r === "string" ? r : (r as { name: string }).name,
      ) as UserRole[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.roles],
  );

  /** Check if the user has an exact role. */
  const hasRole = useCallback(
    (role: UserRole): boolean => userRoles.includes(role),
    [userRoles],
  );

  /** Check if the user has at least one of the given roles. */
  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => roles.some((role) => userRoles.includes(role)),
    [userRoles],
  );

  /**
   * Check if the current user may navigate to the given pathname.
   * Uses the ROUTE_PERMISSIONS map with parent-path fallback.
   */
  const canAccess = useCallback(
    (pathname: string): boolean => {
      const permission = getRoutePermission(pathname);
      if (!permission) return true; // no restriction defined → allow
      return hasAnyRole(permission.roles);
    },
    [hasAnyRole],
  );

  return {
    userRoles,
    hasRole,
    hasAnyRole,
    canAccess,
    isSuperAdmin: hasRole("super_admin"),
    isDioceseAdmin: hasRole("diocese_admin"),
    isSectorAdmin: hasRole("sector_admin"),
    isParishAdmin: hasRole("parish_admin"),
    isCoordinator: hasRole("coordinator"),
  };
}
