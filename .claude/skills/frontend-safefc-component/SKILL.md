---
name: frontend-safefc-component
description: "Pattern for declaring React components with the SafeFC global type in the segue-me frontend.
  Covers the SafeFC<P> declaration, export default pattern, memo() usage, and forwardRef exceptions.
  Use when creating a new component, converting an existing component, adding a feature view,
  or the user says 'new component', 'create component', 'add view', 'SafeFC', 'component declaration'."
---
<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# SafeFC Component Pattern

All components use the globally-declared `SafeFC<P>` type. It is defined in `src/types/global.d.ts` as `FunctionComponent<P & { children?: ReactNode }>` and available everywhere without imports.

## Rules

- Declare as `const X: SafeFC<Props> = () => { ... }`
- Export as `export default X` (separate line, bottom of file)
- For components without props: `const X: SafeFC = () => { ... }`
- For memoized: `const X: SafeFC<Props> = memo((...) => { ... })` using named `memo` import
- **Exceptions**: `React.forwardRef` components (Button, Input, Select, PasswordInput) keep their own pattern
- Never import SafeFC -- it is a global type declaration
- Never use `React.FC`, `React.FunctionComponent`, or `export default function X`

## Example

```tsx
import { SectionCardProps } from './types';

const SectionCard: SafeFC<SectionCardProps> = ({ title, children, action }) => {
  return (
    <div className="bg-panel border border-border rounded-xl overflow-hidden">
      <h2>{title}</h2>
      {children}
    </div>
  );
};

export default SectionCard;
```
Ref: `src/components/SectionCard/index.tsx`

## References

For full code examples with variants:
-> Read `references/examples.md`
