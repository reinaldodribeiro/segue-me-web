---
name: frontend-feature-page
description: "Pattern for creating feature folders and page wrappers in the segue-me Next.js App Router frontend.
  Covers the feature folder structure (List/New/Detail), thin page.tsx wrappers, and the provider hierarchy.
  Use when creating a new feature, adding a new page, implementing a list/create/edit flow,
  or the user says 'new feature', 'add page', 'create list view', 'add detail page', 'new CRUD screen'."
---
<!-- mustard:generated at:2026-04-18T12:00:00Z role:ui -->

# Feature Page Pattern

Features live in `src/features/{Name}/`. Pages in `src/app/app/{route}/page.tsx` are thin wrappers -- all logic lives in the feature component. Every page applies `PermissionGuard`.

## Pattern

Feature folder:
```
src/features/{Name}/
  List/index.tsx    -- useQuery list, search, filters, sort, pagination
  New/index.tsx     -- local form state, validate(), POST via service
  Detail/index.tsx  -- useQuery detail, initializedRef guard, PUT via service
  types.ts          -- feature-specific TypeScript types (optional)
```

Page wrapper rule: one file, `'use client'`, PermissionGuard + feature import only.

## List Component Checklist

- `useQuery` hook with `placeholderData: (prev) => prev`
- `useDebounce(search, 400)` before including in params
- Reset `page` to `1` when `debouncedSearch` or filters change
- `SortableTable` with `ColumnDef[]` for column definitions
- `Pagination` component with `meta` and `onPageChange`
- Use semantic tokens for all styling
- Use `usePermissions()` for conditional admin-only filters

## Example

```tsx
// src/app/app/people/page.tsx
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
Ref: `src/app/app/people/page.tsx`

## References

For full code examples with variants:
-> Read `references/examples.md`
