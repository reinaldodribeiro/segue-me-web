'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useHierarchyDioceses,
  useHierarchySectors,
  useHierarchyParishes,
  useHierarchyParishesForSectors,
} from '@/lib/query/hooks/useHierarchy';
import type { Diocese, Sector, Parish } from '@/interfaces/Parish';

export interface ParishFilterState {
  /* selections */
  dioceseId: string;
  sectorId: string;
  parishId: string;
  setDioceseId: (id: string) => void;
  setSectorId: (id: string) => void;
  setParishId: (id: string) => void;
  /* cascade lists */
  dioceses: Diocese[];
  sectors: Sector[];
  parishes: Parish[];
  loadingCascade: boolean;
  /* derived */
  /** Single selected parish ID, or null when viewing an aggregate scope. */
  selectedParishId: string | null;
  selectedParishName: string | null;
  /**
   * All parish IDs in the current scope (sector / diocese / global).
   * Used to drive aggregate data loading when no single parish is chosen.
   * Empty when the scope is too broad to enumerate (super_admin, no diocese selected).
   */
  scopedParishIds: string[];
  /** Whether aggregate data is still being loaded (diocese-wide parish enumeration). */
  loadingScope: boolean;
  /** True for super/diocese/sector admins who see the filter UI. */
  isAboveParish: boolean;
  isSuperAdmin: boolean;
  isDioceseAdmin: boolean;
  isSectorAdmin: boolean;
}

export function useParishFilter(): ParishFilterState {
  const { user } = useAuth();
  const { isSuperAdmin, isDioceseAdmin, isSectorAdmin } = usePermissions();

  const isAboveParish = isSuperAdmin || isDioceseAdmin || isSectorAdmin;

  const [dioceseId, setDioceseId] = useState(user?.diocese_id ?? '');
  const [sectorId, setSectorId] = useState(user?.sector_id ?? '');
  const [parishId, setParishId] = useState('');

  // ── Cascade queries ───────────────────────────────────────────────────────

  const diocesesQuery = useHierarchyDioceses(isSuperAdmin);

  const effectiveDioceseId = isSuperAdmin
    ? dioceseId
    : isDioceseAdmin
      ? (user?.diocese_id ?? '')
      : '';

  const sectorsQuery = useHierarchySectors(
    (isSuperAdmin || isDioceseAdmin) ? effectiveDioceseId : (isSectorAdmin ? (user?.sector_id ?? '') : '')
  );

  const parishesQuery = useHierarchyParishes(
    isAboveParish ? (sectorId || (isSectorAdmin ? (user?.sector_id ?? '') : '')) : ''
  );

  // ── Diocese-wide parish enumeration (for aggregate when no sector) ────────
  //
  // Triggered when a diocese is selected (or diocese_admin scope) but no
  // sector is chosen. Loads ALL parishes in the diocese for aggregate views.
  const sectorIdsForDioceseScope = useMemo(() => {
    if (!effectiveDioceseId || sectorId) return [];
    return (sectorsQuery.data ?? []).map((s) => s.id);
  }, [effectiveDioceseId, sectorId, sectorsQuery.data]);

  const dioceseParishesQuery = useHierarchyParishesForSectors(sectorIdsForDioceseScope);

  // ── Loading state ─────────────────────────────────────────────────────────

  const loadingCascade =
    diocesesQuery.isLoading ||
    sectorsQuery.isLoading ||
    parishesQuery.isLoading;

  const loadingScope = dioceseParishesQuery.isLoading;

  // ── Derived values ────────────────────────────────────────────────────────

  const dioceses: Diocese[] = diocesesQuery.data ?? [];
  const sectors: Sector[] = sectorsQuery.data ?? [];
  const parishes: Parish[] = parishesQuery.data ?? [];
  const dioceseParishes: Parish[] = dioceseParishesQuery.data ?? [];

  const selectedParishId: string | null = isAboveParish
    ? (parishId || null)
    : (user?.parish_id ?? null);

  const selectedParishName: string | null = isAboveParish
    ? (parishes.find((p) => p.id === parishId)?.name ?? null)
    : (user?.parish?.name ?? null);

  /**
   * Parish IDs representing the current scope:
   * 1. Specific parish selected          → [parishId]
   * 2. Sector selected / sector_admin    → all parishes in that sector
   * 3. Diocese selected / diocese_admin  → all parishes in the diocese
   * 4. super_admin, no diocese           → [] (too broad; caller should prompt)
   * 5. parish_admin / coordinator        → [user.parish_id]
   */
  const scopedParishIds = useMemo<string[]>(() => {
    if (!isAboveParish) return user?.parish_id ? [user.parish_id] : [];
    if (parishId) return [parishId];
    if (parishes.length) return parishes.map((p) => p.id);
    if (dioceseParishes.length) return dioceseParishes.map((p) => p.id);
    return [];
  }, [isAboveParish, parishId, parishes, dioceseParishes, user]);

  // ── Cascade reset handlers ────────────────────────────────────────────────

  function handleSetDioceseId(id: string) {
    setDioceseId(id);
    setSectorId('');
    setParishId('');
  }

  function handleSetSectorId(id: string) {
    setSectorId(id);
    setParishId('');
  }

  return {
    dioceseId,
    sectorId,
    parishId,
    setDioceseId: handleSetDioceseId,
    setSectorId: handleSetSectorId,
    setParishId,
    dioceses,
    sectors,
    parishes,
    loadingCascade,
    selectedParishId,
    selectedParishName,
    scopedParishIds,
    loadingScope,
    isAboveParish,
    isSuperAdmin,
    isDioceseAdmin,
    isSectorAdmin,
  };
}
