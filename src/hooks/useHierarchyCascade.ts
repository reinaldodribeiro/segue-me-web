import { Diocese, Sector, Parish } from '@/interfaces/Parish';
import { usePermissions } from '@/hooks/usePermissions';
import {
  useHierarchyDioceses,
  useHierarchySectors,
  useHierarchyParishes,
} from '@/lib/query/hooks/useHierarchy';

export interface HierarchyCascadeOptions {
  /** Currently selected diocese ID */
  dioceseId: string;
  /** Currently selected sector ID */
  sectorId: string;
  /**
   * Whether to load sectors for the selected diocese.
   * Pass false when sectors are not needed (e.g. when role is diocese_admin).
   * Defaults to true.
   */
  loadSectors?: boolean;
  /**
   * Whether to load parishes for the selected sector.
   * Pass false when parishes are not needed (e.g. creating a parish).
   * Defaults to true.
   */
  loadParishes?: boolean;
}

export interface HierarchyCascadeResult {
  dioceses: Diocese[];
  sectors: Sector[];
  parishes: Parish[];
  loadingDioceses: boolean;
  loadingSectors: boolean;
  loadingParishes: boolean;
}

/**
 * Manages the diocese → sector → parish cascade loading with React Query caching.
 *
 * - Dioceses are fetched only for super_admin (others have a fixed diocese).
 * - Sectors reload whenever dioceseId changes (and loadSectors is true).
 * - Parishes reload whenever sectorId changes (and loadParishes is true).
 * - Results are cached for 5 minutes via React Query.
 */
export function useHierarchyCascade({
  dioceseId,
  sectorId,
  loadSectors = true,
  loadParishes = true,
}: HierarchyCascadeOptions): HierarchyCascadeResult {
  const { isSuperAdmin } = usePermissions();

  const diocesesQuery = useHierarchyDioceses(isSuperAdmin);
  const sectorsQuery = useHierarchySectors(loadSectors ? dioceseId : '');
  const parishesQuery = useHierarchyParishes(loadParishes ? sectorId : '');

  return {
    dioceses: diocesesQuery.data ?? [],
    sectors: sectorsQuery.data ?? [],
    parishes: parishesQuery.data ?? [],
    loadingDioceses: diocesesQuery.isLoading,
    loadingSectors: sectorsQuery.isLoading,
    loadingParishes: parishesQuery.isLoading,
  };
}
