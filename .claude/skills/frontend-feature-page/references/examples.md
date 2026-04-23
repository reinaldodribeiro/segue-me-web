<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Feature Page Examples

## Thin page wrapper
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

## List component structure (key parts)
Ref: `src/features/People/List/index.tsx`
```tsx
const PeopleList: SafeFC = () => {
  useTutorial();
  const { isSuperAdmin, isDioceseAdmin } = usePermissions();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const listParams: Record<string, unknown> = { per_page: 30, page };
  if (debouncedSearch) listParams.search = debouncedSearch;

  const { data, isLoading } = usePersonList(listParams);
  const people = data?.data ?? [];
  const meta = data?.meta ?? null;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);  // Always reset page on filter change
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5">
      {/* Header + filters + SortableTable + Pagination */}
    </div>
  );
};

export default PeopleList;
```

## Simple list (client-side filter, no pagination)
Ref: `src/features/Dioceses/List/index.tsx`
```tsx
const DiocesesList: SafeFC = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading } = useDioceseList();
  const dioceses = data?.data ?? [];
  const filtered = dioceses.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()),
  );
  // Renders HTML <table> directly (no SortableTable needed for small datasets)
};

export default DiocesesList;
```

## Detail page wrapper with dynamic route param
Ref: `src/app/app/people/[id]/page.tsx`
```tsx
'use client';
import { use } from 'react';
import PermissionGuard from '@/components/Auth/PermissionGuard';
import PersonDetail from '@/features/People/Detail';

export default function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <PermissionGuard roles={['super_admin', 'parish_admin', 'coordinator']}>
      <PersonDetail id={id} />
    </PermissionGuard>
  );
}
```
