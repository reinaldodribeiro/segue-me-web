<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Permission Guard Examples

## Page wrapper with PermissionGuard
Ref: `src/app/app/people/page.tsx`
```tsx
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
```

## usePermissions hook usage
Ref: `src/hooks/usePermissions.ts`
```ts
const { isSuperAdmin, isDioceseAdmin, hasRole, hasAnyRole, canAccess } = usePermissions();

// Conditional rendering
const showImportButton = hasAnyRole(['super_admin', 'parish_admin']);

// Sidebar/navigation
const isVisible = canAccess('/app/dioceses');

// Convenience flags
if (isSuperAdmin) { /* full access */ }
```

## Role normalization (Spatie returns string OR object)
Ref: `src/hooks/usePermissions.ts`
```ts
const userRoles = useMemo(
  () => (user?.roles ?? []).map((r) =>
    typeof r === 'string' ? r : (r as { name: string }).name,
  ) as UserRole[],
  [user?.roles],
);
```

## ROUTE_PERMISSIONS map (source of truth)
Ref: `src/constants/permissions.ts`
```ts
'/app/people': {
  roles: ['super_admin', 'parish_admin', 'coordinator'],
  description: 'Listagem de pessoas da paroquia',
},
'/app/dioceses': {
  roles: ['super_admin'],
  description: 'Listagem de dioceses',
},
```

## PermissionGuard component internals
Ref: `src/components/Auth/PermissionGuard/index.tsx`
```tsx
// Checks hasAnyRole(roles), redirects to /app if denied, returns null while redirecting
const PermissionGuard: React.FC<{ roles: UserRole[]; redirectTo?: string }> = ({
  roles, children, redirectTo = '/app',
}) => {
  const { hasAnyRole } = usePermissions();
  const allowed = hasAnyRole(roles);
  useEffect(() => { if (!allowed) router.replace(redirectTo); }, [allowed]);
  if (!allowed) return null;
  return <>{children}</>;
};
```
