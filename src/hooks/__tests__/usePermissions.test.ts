import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

jest.mock('@/hooks/useAuth');
jest.mock('@/constants/permissions');

import { useAuth } from '@/hooks/useAuth';
import { getRoutePermission } from '@/constants/permissions';

const mockUser = (roles: (string | { id: number; name: string; guard_name: string })[]) => {
  (useAuth as jest.Mock).mockReturnValue({ user: { roles } });
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: getRoutePermission returns null (no restriction)
  (getRoutePermission as jest.Mock).mockReturnValue(null);
});

describe('hasRole', () => {
  it('returns true when user has the role as string', () => {
    mockUser(['super_admin']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasRole('super_admin')).toBe(true);
  });

  it('returns true when user has the role as object with name property', () => {
    mockUser([{ id: 1, name: 'super_admin', guard_name: 'web' }]);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasRole('super_admin')).toBe(true);
  });

  it('returns false when user has a different role', () => {
    mockUser(['diocese_admin']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasRole('parish_admin')).toBe(false);
  });
});

describe('hasAnyRole', () => {
  it('returns true when user has one of the given roles', () => {
    mockUser(['sector_admin']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAnyRole(['diocese_admin', 'sector_admin'])).toBe(true);
  });

  it('returns false when user has none of the given roles', () => {
    mockUser(['coordinator']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAnyRole(['diocese_admin', 'sector_admin'])).toBe(false);
  });
});

describe('convenience flags', () => {
  it('isSuperAdmin is true when role is super_admin', () => {
    mockUser(['super_admin']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isSuperAdmin).toBe(true);
  });

  it('isDioceseAdmin is true when role is diocese_admin', () => {
    mockUser(['diocese_admin']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.isDioceseAdmin).toBe(true);
  });
});

describe('canAccess', () => {
  it('returns true when getRoutePermission returns undefined (no restriction)', () => {
    (getRoutePermission as jest.Mock).mockReturnValue(null);
    mockUser(['coordinator']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('/some/route')).toBe(true);
  });

  it('returns true when user has the required role', () => {
    (getRoutePermission as jest.Mock).mockReturnValue({ roles: ['parish_admin'], description: '' });
    mockUser(['parish_admin']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('/some/route')).toBe(true);
  });

  it('returns false when user lacks the required role', () => {
    (getRoutePermission as jest.Mock).mockReturnValue({ roles: ['parish_admin'], description: '' });
    mockUser(['coordinator']);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('/some/route')).toBe(false);
  });
});

describe('no user (null)', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
  });

  it('hasRole returns false for any role', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasRole('super_admin')).toBe(false);
  });

  it('canAccess returns true for unrestricted routes', () => {
    (getRoutePermission as jest.Mock).mockReturnValue(null);
    const { result } = renderHook(() => usePermissions());
    expect(result.current.canAccess('/some/route')).toBe(true);
  });
});
