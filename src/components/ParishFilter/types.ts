import type { ParishFilterState } from '@/hooks/useParishFilter';

export type ParishFilterProps = Pick<
  ParishFilterState,
  | 'dioceseId' | 'sectorId' | 'parishId'
  | 'setDioceseId' | 'setSectorId' | 'setParishId'
  | 'dioceses' | 'sectors' | 'parishes'
  | 'loadingCascade' | 'loadingScope'
  | 'scopedParishIds'
  | 'isSuperAdmin' | 'isDioceseAdmin' | 'isSectorAdmin'
  | 'selectedParishName'
>;
