---
name: frontend-permission-guard
description: "Pattern for role-based access control in the segue-me frontend. Covers PermissionGuard component,
  usePermissions hook, ROUTE_PERMISSIONS map, and the role normalization for Spatie Laravel Permission.
  Use when adding a new protected page, checking if a user can perform an action, restricting UI based on role,
  adding a route to the permission map, or the user says 'only admin can', 'check permission', 'hide for coordinator',
  'add access control', 'restrict route'."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Permission Guard Pattern

Role-based access has two layers: `PermissionGuard` wraps page components; `usePermissions()` provides role checks anywhere. The single source of truth is `ROUTE_PERMISSIONS` in `src/constants/permissions.ts`.

## Pattern

Five roles: `super_admin > diocese_admin > sector_admin > parish_admin > coordinator`

Rules:
- `super_admin` is unrestricted everywhere (backend `before()` policy)
- Roles returned by Spatie may be strings OR objects `{id, name, guard_name}` -- `usePermissions` normalizes both
- `canAccess(pathname)` falls back to nearest parent route in `ROUTE_PERMISSIONS`
- Never call `.includes('role_name')` on `user.roles` directly -- always use `usePermissions()`
- Every protected page MUST be wrapped in `<PermissionGuard>`
- Sidebar derives visible items from `canAccess(href)` -- no separate nav role map

## Example

```tsx
// Page wrapper
export default function Page() {
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <PeopleList />
    </PermissionGuard>
  );
}

// Role check in component
const { isSuperAdmin, hasAnyRole, canAccess } = usePermissions();
if (!hasAnyRole(['parish_admin', 'coordinator'])) return null;
```
Ref: `src/app/app/people/page.tsx`, `src/hooks/usePermissions.ts`

## Adding a New Route Permission

Add entry to `ROUTE_PERMISSIONS` in `src/constants/permissions.ts`:
```ts
'/app/new-feature': {
  roles: ['super_admin', 'parish_admin'],
  description: 'Brief description of this route',
},
```

## References

For full code examples:
-> Read `references/examples.md`
