import { ROUTE_PERMISSIONS, getRoutePermission } from '../permissions';
import { ROLE_HIERARCHY } from '@/types/roles';
import type { UserRole } from '@/types/roles';

const ALL_ROLES: UserRole[] = ['super_admin', 'diocese_admin', 'sector_admin', 'parish_admin', 'coordinator'];

// ─── ROUTE_PERMISSIONS structure ────────────────────────────────────────────

describe('ROUTE_PERMISSIONS structure', () => {
  it('every route starts with /app', () => {
    for (const route of Object.keys(ROUTE_PERMISSIONS)) {
      expect(route).toMatch(/^\/app/);
    }
  });

  it('every route has at least one role', () => {
    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      expect(perm.roles.length).toBeGreaterThan(0);
    }
  });

  it('every route only contains valid roles', () => {
    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      for (const role of perm.roles) {
        expect(ALL_ROLES).toContain(role);
      }
    }
  });

  it('every route has a non-empty description', () => {
    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      expect(perm.description.length).toBeGreaterThan(0);
    }
  });

  it('super_admin has access to every route except parish-specific settings', () => {
    // Parish settings is intentionally parish_admin only —
    // super_admin manages at hierarchy level, not per-parish config.
    const PARISH_ONLY_ROUTES = ['/app/settings/parish'];

    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (PARISH_ONLY_ROUTES.includes(route)) continue;
      expect(perm.roles).toContain('super_admin');
    }
  });
});

// ─── Role hierarchy consistency ─────────────────────────────────────────────

describe('role hierarchy consistency', () => {
  /**
   * Routes where the strict hierarchy doesn't apply:
   * - /app/settings/parish: parish_admin only (parish-specific config)
   * - /app/people*: PersonPolicy.viewAny excludes diocese_admin/sector_admin by design
   * - /app/encounters/new, /app/encounters/[id]/teams: create/team-build is parish-level
   * - /app/movements/new, /app/movements/[id]/teams: create is parish-level only
   */
  const HIERARCHY_EXCEPTIONS = [
    '/app/settings/parish',
    '/app/people',
    '/app/people/new',
    '/app/people/[id]',
    '/app/encounters/new',
    '/app/encounters/[id]/teams',
    '/app/movements/new',
    '/app/movements/[id]/teams',
  ];

  it('respects role hierarchy on administrative routes', () => {
    for (const [route, perm] of Object.entries(ROUTE_PERMISSIONS)) {
      if (HIERARCHY_EXCEPTIONS.includes(route)) continue;

      const roles = perm.roles;
      for (const role of roles) {
        const roleIndex = ROLE_HIERARCHY.indexOf(role);
        const higherRoles = ROLE_HIERARCHY.slice(0, roleIndex);
        for (const higherRole of higherRoles) {
          expect(roles).toContain(higherRole);
        }
      }
    }
  });
});

// ─── Critical access policies ───────────────────────────────────────────────

describe('critical access policies', () => {
  it('audit logs are restricted to super_admin and diocese_admin only', () => {
    const perm = ROUTE_PERMISSIONS['/app/audit'];
    expect(perm.roles).toEqual(['super_admin', 'diocese_admin']);
    expect(perm.roles).not.toContain('sector_admin');
    expect(perm.roles).not.toContain('parish_admin');
    expect(perm.roles).not.toContain('coordinator');
  });

  it('AI logs are restricted to super_admin only', () => {
    const perm = ROUTE_PERMISSIONS['/app/ai-logs'];
    expect(perm.roles).toEqual(['super_admin']);
  });

  it('diocese management is super_admin only', () => {
    for (const route of ['/app/dioceses', '/app/dioceses/new', '/app/dioceses/[id]']) {
      expect(ROUTE_PERMISSIONS[route].roles).toEqual(['super_admin']);
    }
  });

  it('sector management excludes parish_admin and coordinator', () => {
    for (const route of ['/app/sectors', '/app/sectors/new', '/app/sectors/[id]']) {
      const roles = ROUTE_PERMISSIONS[route].roles;
      expect(roles).not.toContain('parish_admin');
      expect(roles).not.toContain('coordinator');
    }
  });

  it('parish management excludes parish_admin and coordinator', () => {
    for (const route of ['/app/parishes', '/app/parishes/new', '/app/parishes/[id]']) {
      const roles = ROUTE_PERMISSIONS[route].roles;
      expect(roles).not.toContain('parish_admin');
      expect(roles).not.toContain('coordinator');
    }
  });

  it('people pages exclude diocese_admin and sector_admin', () => {
    for (const route of ['/app/people', '/app/people/new', '/app/people/[id]']) {
      const roles = ROUTE_PERMISSIONS[route].roles;
      expect(roles).not.toContain('diocese_admin');
      expect(roles).not.toContain('sector_admin');
    }
  });

  it('coordinator cannot manage users', () => {
    for (const route of ['/app/users', '/app/users/new', '/app/users/[id]']) {
      expect(ROUTE_PERMISSIONS[route].roles).not.toContain('coordinator');
    }
  });

  it('coordinator cannot create movements', () => {
    expect(ROUTE_PERMISSIONS['/app/movements/new'].roles).not.toContain('coordinator');
  });

  it('parish settings restricted to parish_admin only', () => {
    expect(ROUTE_PERMISSIONS['/app/settings/parish'].roles).toEqual(['parish_admin']);
  });

  it('dashboard and profile allow all authenticated roles', () => {
    for (const route of ['/app', '/app/profile', '/app/reports']) {
      expect(ROUTE_PERMISSIONS[route].roles.sort()).toEqual([...ALL_ROLES].sort());
    }
  });
});

// ─── getRoutePermission ─────────────────────────────────────────────────────

describe('getRoutePermission', () => {
  it('returns exact match for a known route', () => {
    const perm = getRoutePermission('/app/people');
    expect(perm).toEqual(ROUTE_PERMISSIONS['/app/people']);
  });

  it('normalizes UUID segments to [id]', () => {
    const perm = getRoutePermission('/app/people/550e8400-e29b-41d4-a716-446655440000');
    expect(perm).toEqual(ROUTE_PERMISSIONS['/app/people/[id]']);
  });

  it('normalizes nested UUID segments', () => {
    const perm = getRoutePermission('/app/encounters/550e8400-e29b-41d4-a716-446655440000/teams');
    expect(perm).toEqual(ROUTE_PERMISSIONS['/app/encounters/[id]/teams']);
  });

  it('falls back to parent route when no exact match exists', () => {
    const perm = getRoutePermission('/app/people/550e8400-e29b-41d4-a716-446655440000/some-unknown-sub');
    // Should fall back to /app/people/[id] or /app/people
    expect(perm).not.toBeNull();
    expect(perm!.roles).toContain('parish_admin');
  });

  it('returns null for a completely unknown route', () => {
    const perm = getRoutePermission('/unknown/route');
    expect(perm).toBeNull();
  });

  it('returns the /app permission for /app itself', () => {
    const perm = getRoutePermission('/app');
    expect(perm).toEqual(ROUTE_PERMISSIONS['/app']);
  });
});
