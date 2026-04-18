<!-- mustard:generated at:2026-04-01T20:20:04Z role:ui -->

# Stack: Frontend (ui)

> Technology stack, project structure, and tooling for the segue-me Next.js frontend.

## Runtime & Framework

| Dependency | Version | Role |
|------------|---------|------|
| next | ^16.2.1 | App Router, Turbopack dev, Edge middleware |
| react | ^19.0.0 | UI library |
| react-dom | ^19.0.0 | DOM renderer |
| typescript | ^5 | Strict mode, `@/*` path alias → `./src/*` |
| tailwindcss | ^3.4.17 | CSS utility framework with CSS variable tokens |

## Key Dependencies

| Dependency | Version | Role |
|------------|---------|------|
| @tanstack/react-query | ^5.95.2 | All server state management |
| axios | ^1.7.9 | HTTP client (wrapped in `src/config/api.ts`) |
| @dnd-kit/core | ^6.3.1 | Drag-and-drop (encounter team builder) |
| @dnd-kit/sortable | ^10.0.0 | Sortable DnD primitives |
| lucide-react | ^0.468.0 | Icon set |
| recharts | ^3.8.0 | Charts (dashboard engagement/score) |

## Project Structure

```
frontend/src/
  app/              — Next.js App Router pages (thin wrappers only)
    app/            — Protected routes (auth-gated by middleware + PermissionGuard)
    auth/           — Public auth pages (login, forgot-password, reset-password)
    providers.tsx   — Root provider composition
  components/       — Shared UI primitives (Button, Input, Select, SortableTable…)
  config/
    api.ts          — Axios singleton with auth interceptors
  constants/
    permissions.ts  — ROUTE_PERMISSIONS map (source of truth for route access)
    tutorials.ts    — Tutorial step definitions
  context/          — React Contexts (Auth, Theme, Toast, ParishColor, Layout, Tutorial)
  features/         — Feature components (List, New, Detail per entity)
  hooks/            — Custom hooks (usePermissions, useErrorHandler, useHierarchyCascade…)
  interfaces/       — TypeScript interfaces per domain
  lib/query/        — TanStack Query client, keys factory, per-entity hooks
  middleware.ts     — Edge middleware (auth redirect gate)
  services/api/     — Service classes extending CrudService
  types/            — Global type aliases (roles)
  utils/            — Helpers: cn(), storageUrl(), formatDate(), slugify()
```

## Commands

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run lint     # ESLint via next lint
npm run start    # Start production server
npx tsc --noEmit # Type-check without emitting (no test runner configured)
```

## Environment Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STORAGE_URL=http://localhost:8000/storage
```

## Linting & Type Checking

- ESLint via `eslint-config-next` — run with `npm run lint`
- TypeScript strict mode — validate with `npx tsc --noEmit`
- No test runner configured

## Theming Tokens

CSS variable tokens — NEVER use hardcoded colors:

| Token | Usage |
|-------|-------|
| `text-text` | Primary text |
| `text-text-muted` | Secondary/muted |
| `bg-panel` | Card/panel backgrounds |
| `border-border` | Borders |
| `bg-hover` | Hover states |
| `text-primary` / `bg-primary` | Brand purple `#6d28d9` |
| `bg-input-bg`, `border-input-border`, `text-input-text` | Form inputs |

Dark mode: `[data-theme="dark"]` selector via `ThemeProvider`.
Ref: `tailwind.config.ts`
