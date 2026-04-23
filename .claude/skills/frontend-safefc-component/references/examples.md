<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# SafeFC Component Examples

## Basic component with props
Ref: `src/components/SectionCard/index.tsx`
```tsx
import { SectionCardProps } from './types';

const SectionCard: SafeFC<SectionCardProps> = ({ title, children, action, ...rest }) => {
  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden" {...rest}>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default SectionCard;
```

## Feature component (no props)
Ref: `src/features/People/List/index.tsx`
```tsx
const PeopleList: SafeFC = () => {
  useTutorial();
  const { isSuperAdmin, isDioceseAdmin } = usePermissions();
  // ... feature logic
  return <div className="p-6 max-w-6xl mx-auto space-y-5">...</div>;
};

export default PeopleList;
```

## Memoized component with SafeFC
Ref: `src/components/Layout/index.tsx`
```tsx
import { memo } from 'react';
import { LayoutProps } from './types';

const Layout: SafeFC<LayoutProps> = memo(({ children }) => {
  const { isSidebarCollapsed } = useLayout();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      {/* ... */}
      {children}
    </div>
  );
});

export default Layout;
```

## Memoized with named function (alternative)
Ref: `src/components/Layout/Sidebar/NavItem/index.tsx`
```tsx
import { memo } from 'react';

const NavItem = memo(function NavItem({ href, icon: Icon, label, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname();
  // ... render logic
});

export default NavItem;
```

## forwardRef exception (NOT SafeFC)
Ref: `src/components/Button/index.tsx`
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => {
    return <button ref={ref} disabled={disabled || loading} className={cn(...)} {...props}>{children}</button>;
  },
);
Button.displayName = 'Button';
export default Button;
```
