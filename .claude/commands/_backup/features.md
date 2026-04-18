<!-- mustard:generated at:2026-04-01T20:20:04Z role:ui -->

# Features: Frontend (ui)

> Feature inventory for the segue-me Parish Meeting Management System frontend.

## Protected Features (under /app)

| Feature | Route(s) | Complexity | Min Role |
|---------|----------|-----------|---------|
| Dashboard | `/app` | medium | all |
| People | `/app/people`, `/new`, `/[id]` | complex | parish_admin, coordinator |
| Encounters | `/app/encounters`, `/new`, `/[id]`, `/[id]/teams` | complex | all |
| Movements | `/app/movements`, `/new`, `/[id]`, `/[id]/teams` | complex | diocese_admin+ |
| Users | `/app/users`, `/new`, `/[id]` | medium | parish_admin+ |
| Dioceses | `/app/dioceses`, `/new`, `/[id]` | simple | super_admin |
| Sectors | `/app/sectors`, `/new`, `/[id]` | simple | diocese_admin+ |
| Parishes | `/app/parishes`, `/new`, `/[id]` | medium | sector_admin+ |
| Parish Settings | `/app/settings/parish` | medium | parish_admin |
| Reports | `/app/reports` | medium | all |
| Audit Logs | `/app/audit` | simple | diocese_admin+ |
| AI Logs | `/app/ai-logs` | simple | super_admin |
| Profile | `/app/profile` | simple | all |
| Evaluation | `/app/avaliacao` | medium | parish_admin+ |

## Feature Folder Convention

```
src/features/{Name}/
  List/index.tsx      — Paginated list with search, filters, sort
  New/index.tsx       — Create form with validation
  Detail/index.tsx    — Edit form with initializedRef guard
  Import/index.tsx    — File import (People only)
  OcrImport/          — OCR image scan (People only)
  Teams/index.tsx     — DnD team builder (Encounters, Movements)
```

Page files (`src/app/app/{route}/page.tsx`) are thin wrappers:
```tsx
'use client';
export default function Page() {
  return <PermissionGuard roles={[...]}><FeatureList /></PermissionGuard>;
}
```
Ref: `src/app/app/people/page.tsx`

## Feature Complexity Matrix

| Level | Signal | Examples |
|-------|--------|---------|
| Simple | Single-entity CRUD, no cascade | Dioceses, Audit, AI Logs |
| Medium | Cascade selectors, image upload, settings | Parishes, Users, Profile |
| Complex | Import flows, polling, DnD teams, duplicate detection | People, Encounters |

## Dashboard Sub-components

`src/features/Dashboard/` contains inline sub-components:
- `EngagementChart` — Recharts engagement visualization
- `ScoreChart` — Score distribution chart
- `StatCard` — Metric card
- `TopEngagedList` — Top engaged people list
- `constants.ts`, `types.ts` — Dashboard-specific types

Ref: `src/features/Dashboard/index.tsx`

## Auth Features (under /auth)

| Feature | Route | Notes |
|---------|-------|-------|
| Login | `/auth/login` | Sets localStorage + syncs cookie |
| Forgot Password | `/auth/forgot-password` | Email-based reset flow |
| Reset Password | `/auth/reset-password` | Token-based new password |

Ref: `src/features/Auth/`
