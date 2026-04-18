export type UserRole =
  | 'super_admin'
  | 'diocese_admin'
  | 'sector_admin'
  | 'parish_admin'
  | 'coordinator';

export const ROLES = {
  SUPER_ADMIN: 'super_admin' as UserRole,
  DIOCESE_ADMIN: 'diocese_admin' as UserRole,
  SECTOR_ADMIN: 'sector_admin' as UserRole,
  PARISH_ADMIN: 'parish_admin' as UserRole,
  COORDINATOR: 'coordinator' as UserRole,
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Administrador',
  diocese_admin: 'Administrador Diocesano',
  sector_admin: 'Administrador de Setor',
  parish_admin: 'Administrador Paroquial',
  coordinator: 'Coordenador',
};

/**
 * Ordered by scope: super_admin has widest scope, coordinator has narrowest.
 * Useful for comparisons like "can this user manage that user?".
 */
export const ROLE_HIERARCHY: UserRole[] = [
  'super_admin',
  'diocese_admin',
  'sector_admin',
  'parish_admin',
  'coordinator',
];
