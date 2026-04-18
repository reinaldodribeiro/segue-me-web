import { UserRole } from '@/types/roles';

export type RoutePermission = {
  /** Roles that may access this route (and all sub-routes). */
  roles: UserRole[];
  /** Human-readable description of what this route does. */
  description: string;
};

/**
 * Route permission map.
 *
 * Keys are the canonical prefix of each protected route under /app.
 * Sub-routes inherit the nearest parent's permission unless overridden.
 *
 * Role access rules (mirrors backend policies):
 *   super_admin    → unrestricted access everywhere (before() hook in all Laravel policies)
 *   diocese_admin  → viewAny encounters/movements across diocese + user/hierarchy management
 *   sector_admin   → viewAny encounters/movements across sector + user/hierarchy management
 *   parish_admin   → full CRUD within own parish (people, encounters, movements, users, settings)
 *   coordinator    → people + encounters within own parish only (no user/settings management)
 *
 * Note: diocese_admin and sector_admin have viewAny on encounters/movements (EncounterPolicy,
 * MovementPolicy). They do NOT have viewAny on people (PersonPolicy restricts that to parish scope).
 */
export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  // ─── Global (all authenticated roles) ─────────────────────────────────────
  '/app': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator'],
    description: 'Dashboard principal',
  },
  '/app/profile': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator'],
    description: 'Perfil e senha do usuário logado',
  },
  '/app/reports': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator'],
    description: 'Relatórios (escopo filtrado pelo papel do usuário)',
  },

  // ─── People ────────────────────────────────────────────────────────────────
  // PersonPolicy.viewAny → parish_admin, coordinator. super_admin via before().
  // diocese_admin / sector_admin do NOT have viewAny on people.
  '/app/people': {
    roles: ['super_admin', 'parish_admin', 'coordinator'],
    description: 'Fichas de cadastro da paróquia',
  },
  '/app/people/new': {
    roles: ['super_admin', 'parish_admin', 'coordinator'],
    description: 'Cadastrar nova ficha',
  },
  '/app/people/[id]': {
    roles: ['super_admin', 'parish_admin', 'coordinator'],
    description: 'Detalhe e histórico de uma ficha',
  },

  // ─── Movements ─────────────────────────────────────────────────────────────
  // MovementPolicy.viewAny → diocese_admin and above. super_admin via before().
  // create/update/delete → parish_admin only (plus super_admin via before()).
  '/app/movements': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin'],
    description: 'Listagem de movimentos',
  },
  '/app/movements/new': {
    roles: ['super_admin', 'parish_admin'],
    description: 'Criar novo movimento',
  },
  '/app/movements/[id]': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin'],
    description: 'Detalhes do movimento',
  },
  '/app/movements/[id]/teams': {
    roles: ['super_admin', 'parish_admin'],
    description: 'Configuração de equipes-modelo do movimento',
  },

  // ─── Encounters ────────────────────────────────────────────────────────────
  // EncounterPolicy.viewAny → diocese_admin and above + parish_admin + coordinator.
  // delete → parish_admin only (plus super_admin via before()).
  '/app/encounters': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator'],
    description: 'Listagem de encontros',
  },
  '/app/encounters/new': {
    roles: ['super_admin', 'parish_admin', 'coordinator'],
    description: 'Criar novo encontro',
  },
  '/app/encounters/[id]': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator'],
    description: 'Resumo e status do encontro',
  },
  '/app/encounters/[id]/teams': {
    roles: ['super_admin', 'parish_admin', 'coordinator'],
    description: 'Montagem de equipes do encontro (drag & drop)',
  },

  // ─── User management (hierarchical) ───────────────────────────────────────
  '/app/users': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin'],
    description: 'Listagem de usuários (escopo por hierarquia)',
  },
  '/app/users/new': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin'],
    description: 'Criar novo usuário',
  },
  '/app/users/[id]': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin'],
    description: 'Editar usuário',
  },

  // ─── Dioceses (super_admin only) ──────────────────────────────────────────
  '/app/dioceses': {
    roles: ['super_admin'],
    description: 'Listagem de dioceses',
  },
  '/app/dioceses/new': {
    roles: ['super_admin'],
    description: 'Criar diocese',
  },
  '/app/dioceses/[id]': {
    roles: ['super_admin'],
    description: 'Editar diocese',
  },

  // ─── Sectors (super_admin + diocese_admin) ────────────────────────────────
  '/app/sectors': {
    roles: ['super_admin', 'diocese_admin'],
    description: 'Listagem de setores',
  },
  '/app/sectors/new': {
    roles: ['super_admin', 'diocese_admin'],
    description: 'Criar setor',
  },
  '/app/sectors/[id]': {
    roles: ['super_admin', 'diocese_admin'],
    description: 'Editar setor',
  },

  // ─── Parishes (super_admin + diocese_admin + sector_admin) ───────────────
  '/app/parishes': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin'],
    description: 'Listagem de paróquias',
  },
  '/app/parishes/new': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin'],
    description: 'Criar paróquia',
  },
  '/app/parishes/[id]': {
    roles: ['super_admin', 'diocese_admin', 'sector_admin'],
    description: 'Editar paróquia',
  },

  // ─── Parish settings (parish_admin manages own parish) ────────────────────
  '/app/settings/parish': {
    roles: ['parish_admin'],
    description: 'Configurações da paróquia: logo, cores, skills disponíveis',
  },

  // ─── Audit logs (super_admin + diocese_admin) ─────────────────────────────
  '/app/audit': {
    roles: ['super_admin', 'diocese_admin'],
    description: 'Logs de auditoria de ações críticas',
  },

  // ─── AI API logs (super_admin only) ───────────────────────────────────────
  '/app/ai-logs': {
    roles: ['super_admin'],
    description: 'Logs de uso da API Anthropic Claude (tokens, custo, erros)',
  },
};

/** Returns the allowed roles for a given pathname, or null if no restriction is defined. */
export function getRoutePermission(pathname: string): RoutePermission | null {
  if (ROUTE_PERMISSIONS[pathname]) return ROUTE_PERMISSIONS[pathname];

  // Normalise dynamic segments and try again (e.g. /app/people/abc → /app/people/[id])
  const normalized = pathname.replace(/\/[0-9a-f-]{36}/g, '/[id]');
  if (ROUTE_PERMISSIONS[normalized]) return ROUTE_PERMISSIONS[normalized];

  // Walk up the path tree to find nearest parent permission
  const segments = pathname.split('/').filter(Boolean);
  for (let i = segments.length - 1; i > 0; i--) {
    const parent = '/' + segments.slice(0, i).join('/');
    if (ROUTE_PERMISSIONS[parent]) return ROUTE_PERMISSIONS[parent];
  }

  return null;
}
