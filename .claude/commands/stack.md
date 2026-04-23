<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Stack: Frontend (ui)

> Technology stack, dependency versions, project structure, tooling, environment, and build analysis.

## Core Stack

| Tech | Version | Notes |
|------|---------|-------|
| Next.js | ^16.2.1 | App Router, Turbopack dev server, Edge Middleware |
| React | ^19.0.0 | Concurrent features available |
| TypeScript | ^5 | `strict: true`, `@/*` path alias, `ES2017` target |
| Tailwind CSS | ^3.4.17 | CSS variable tokens, `[data-theme="dark"]` dark mode |
| Axios | ^1.7.9 | HTTP client with interceptor pipeline |
| TanStack Query | ^5.95.2 | Server state, `staleTime: 2min`, `gcTime: 10min`, `retry: 1` |
| @dnd-kit | core ^6.3.1, sortable ^10.0.0 | Drag-and-drop for encounter team building |
| Recharts | ^3.8.0 | Dashboard charts (lazy-loaded via `next/dynamic`) |
| Lucide React | ^0.468.0 | Tree-shakeable icon library |

Ref: `package.json`, `tsconfig.json`

## TypeScript Strictness

- `strict: true` -- full strict mode enabled
- `isolatedModules: true` -- required for Turbopack/SWC
- `noEmit: true` -- build handled by Next.js
- `moduleResolution: bundler` -- modern resolution
- Path alias: `@/*` maps to `./src/*`
- Global types: `src/types/global.d.ts` defines `SafeFC<P>` globally

Ref: `tsconfig.json`, `src/types/global.d.ts`

## Next.js Configuration

- `images.remotePatterns` configured for `NEXT_PUBLIC_STORAGE_URL` origin
- No custom webpack overrides (uses Turbopack)
- No `output: 'standalone'` (default server mode)
- No custom headers, rewrites, or redirects

Ref: `next.config.ts`

## Bundle Size Analysis

| Dependency | Approx. Size | Mitigation |
|-----------|-------------|-----------|
| recharts | ~300 KB gzipped | Lazy-loaded via `next/dynamic` with `ssr: false` |
| @dnd-kit | ~50 KB | Only loaded on Teams pages |
| lucide-react | Tree-shakeable | Named imports only |
| axios | ~14 KB | Always loaded (core HTTP) |
| @tanstack/react-query-devtools | Dev only | Conditionally rendered in development |

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    app/                # Protected routes (/app/*)
    auth/               # Public routes (/auth/*)
    providers.tsx       # Provider composition (7 providers)
    layout.tsx          # Root layout (html, body, Providers)
  features/             # Feature modules (List/New/Detail per entity, 14 features)
  components/           # Reusable UI components (24 directories)
  services/api/         # API service classes (13 services extending CrudService)
  lib/query/            # TanStack Query: client, keys, provider, hooks/ (11 hook files)
  context/              # React context providers (8 contexts)
  hooks/                # Custom hooks (17 hooks)
  interfaces/           # TypeScript interfaces per domain
  types/                # Global types (SafeFC, roles)
  constants/            # App constants (permissions, tutorials)
  utils/                # Helpers: cn(), storageUrl(), formatDate(), slugify(), authCookie
  config/               # API client configuration (Axios singleton)
  middleware.ts         # Edge Middleware (auth redirect gate)
```

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint via next lint
npm run start        # Start production server
npm run test         # Jest tests
npm run test:watch   # Jest in watch mode
npx tsc --noEmit     # Type-check without emitting
```

## Environment Variables

| Variable | Default | Usage |
|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Axios baseURL in `src/config/api.ts` |
| `NEXT_PUBLIC_STORAGE_URL` | `http://localhost:8000/storage` | Image/file URLs via `storageUrl()` |

## Theming Tokens

All colors resolve to CSS variables. Never use hardcoded Tailwind color classes.

| Token | Usage |
|-------|-------|
| `text-text`, `text-text-muted` | Primary/secondary text |
| `bg-panel`, `bg-panel-2`, `bg-card-bg` | Card/panel backgrounds |
| `border-border` | Borders |
| `bg-hover`, `text-hover-fg` | Hover states |
| `text-primary`, `bg-primary` | Brand purple |
| `bg-primary-subtle`, `text-secondary` | Subtle/secondary brand |
| `bg-input-bg`, `border-input-border`, `text-input-text` | Form inputs |

Dark mode: `[data-theme="dark"]` selector via ThemeProvider.
Ref: `tailwind.config.ts`

## Provider Stack (outermost to innermost)

Ref: `src/app/providers.tsx`

`QueryProvider` > `ToastProvider` > `ThemeProvider` > `ParishColorProvider` > `LayoutProvider` > `AuthProvider` > `TutorialProvider`

Protected app pages additionally wrap content with `AnalyticsProvider`.
