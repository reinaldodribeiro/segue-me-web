<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Features: Frontend (ui)

> Feature inventory, folder conventions, complexity matrix, and performance/scalability analysis.

## Feature Inventory

| Feature | Path | Complexity | Sub-views | Min Role |
|---------|------|-----------|-----------|----------|
| Dashboard | `features/Dashboard/` | Medium | StatCard, EngagementChart, ScoreChart | all |
| People | `features/People/` | High | List, New, Detail, Import, OcrImport | parish_admin, coordinator |
| Encounters | `features/Encounters/` | High | List, New, Detail, Teams, Encontristas | all (varies by sub-route) |
| Movements | `features/Movements/` | Medium | List, New, Detail (with SortableTeamRow, TeamForm) | diocese_admin+ |
| Dioceses | `features/Dioceses/` | Low | List, New, Detail | super_admin |
| Sectors | `features/Sectors/` | Low | List, New, Detail | diocese_admin+ |
| Parishes | `features/Parishes/` | Medium | List, New, Detail, Settings | sector_admin+ |
| Users | `features/Users/` | Medium | List, New, Detail | parish_admin+ |
| Auth | `features/Auth/` | Low | Login, Layout | public |
| Evaluation | `features/Evaluation/` | Medium | PinVerification, EvaluationForm, Success | public (PIN auth) |
| Reports | `features/Reports/` | Medium | EncounterReports, EncounterDetail, ChartsBundle | all |
| Profile | `features/Profile/` | Low | index, TutorialSection | all |
| Audit | `features/Audit/` | Low | List | diocese_admin+ |
| AiLogs | `features/AiLogs/` | Low | List | super_admin |

## Folder Conventions

Standard feature folder: `src/features/{Name}/`
- `List/index.tsx` -- paginated list with filters, sorting
- `New/index.tsx` -- create form with validation
- `Detail/index.tsx` -- edit form with `initializedRef` guard
- `Settings/index.tsx` -- feature-specific settings (e.g. Parishes)
- `types.ts` -- feature-specific TypeScript types
- Sub-components as nested folders with `index.tsx` + `types.ts`

All feature components use `const X: SafeFC = () => {}` + `export default X`.
Page wrappers in `src/app/app/{name}/page.tsx` -- thin `'use client'` wrapper with PermissionGuard.
Ref: `src/app/app/people/page.tsx`

## Complexity Matrix

| Level | Signals | Features |
|-------|---------|---------|
| Low | Single-entity CRUD, no cascade, minimal state | Dioceses, Sectors, Audit, AiLogs, Profile |
| Medium | Cascade selectors, file upload, charts, settings | Parishes, Users, Movements, Dashboard, Reports, Evaluation |
| High | Import flows, polling, DnD, duplicate detection, AI features | People, Encounters |

## Performance Characteristics

### Data Loading Patterns

| Feature | Strategy | Assessment |
|---------|----------|-----------|
| People List | Server-side pagination + TanStack Query | GOOD: offloads to backend, cached |
| Encounters List | Server-side pagination + TanStack Query | GOOD: same pattern |
| Dioceses List | Full load + client-side filter | OK: small dataset (~tens) |
| Dashboard | `useDashboardStats` + TanStack Query | GOOD: uses query cache |
| Encounter Teams | TanStack Query for teams + available people | GOOD: cached, auto-invalidated |
| Hierarchy Cascade | Waterfall: diocese -> sector -> parish | CONCERN: sequential API calls |
| Reports | `useEngagementReport` via AnalyticsContext | GOOD: shared cache |

### Scalability Concerns

1. **Hierarchy waterfall for super_admin** -- Loading all parishes requires diocese -> sector -> parish cascade (sequential API calls). Mitigated by 5min React Query staleTime but first load is slow.
   Ref: `src/lib/query/hooks/useHierarchy.ts`

2. **Unbounded available-people list** -- Encounter Teams loads ALL available people in one request. Could be slow for large parishes.
   Ref: `src/services/api/EncounterService.ts` (`availablePeople`)

## Component Inventory (24 shared components)

Auth, Button, ColorPicker, DateInput, Drawer, EmptySlot, FeedbackMsg, Input, Layout, MemberAvatar, Pagination, ParishFilter, PasswordInput, PersonProfileDrawer, SectionCard, Select, SortableTable, TeamIconPicker, TeamMapCard, Toast, Toggle, Tooltip, TopEngagedList, Tutorial

## Service Inventory (13 services)

AdminUserService, AiApiLogService, AuditService, AuthService, CrudService (base), DioceseService, EncounterService, EvaluationService, MovementService, ParishService, PersonService, SectorService, UserService
Ref: `src/services/api/`

## Context Inventory (8 contexts)

AnalyticsContext, AuthContext, EncounterTeamsContext, LayoutContext, ParishColorContext, ThemeContext, ToastContext, TutorialContext
Ref: `src/context/`

## Hook Inventory (17 hooks)

useAnalytics, useAuth, useClientPagination, useDebounce, useEncounterTeams, useErrorHandler, useHierarchyCascade, useLayout, useLocalStorage, useParishColor, useParishFilter, usePermissions, useTheme, useToast, useTutorial, useTutorialContext
Ref: `src/hooks/`
