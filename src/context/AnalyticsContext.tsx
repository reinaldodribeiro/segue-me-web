'use client';

import React, {
  createContext,
  useCallback,
  useMemo,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useParishFilter, ParishFilterState } from '@/hooks/useParishFilter';
import { useEngagementReport } from '@/lib/query/hooks/useEngagement';
import { queryKeys } from '@/lib/query/keys';
import type { EngagementReportData } from '@/features/Reports/types';

/* ─── types ─────────────────────────────────────────────────────── */

export interface AnalyticsContextData {
  /** Full parish filter state (selections, cascade lists, derived IDs). */
  filter: ParishFilterState;
  /** Aggregated engagement report for the current scope. null = no scope yet. */
  engagement: EngagementReportData | null;
  loadingEngagement: boolean;
  /** Force a fresh reload (clears the scope cache). */
  refreshEngagement: () => void;
}

/* ─── context ────────────────────────────────────────────────────── */

export const AnalyticsContext = createContext<AnalyticsContextData | null>(null);

/* ─── provider ───────────────────────────────────────────────────── */

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const filter = useParishFilter();
  const { scopedParishIds } = filter;
  const queryClient = useQueryClient();

  const sortedIds = useMemo(() => [...scopedParishIds].sort(), [scopedParishIds]);
  const { data: engagement = null, isLoading: loadingEngagement } = useEngagementReport(scopedParishIds);

  const refreshEngagement = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.engagement.report(sortedIds) });
  }, [queryClient, sortedIds]);

  const valueData: AnalyticsContextData = useMemo(
    () => ({ filter, engagement, loadingEngagement, refreshEngagement }),
    [filter, engagement, loadingEngagement, refreshEngagement],
  );

  return (
    <AnalyticsContext.Provider value={valueData}>
      {children}
    </AnalyticsContext.Provider>
  );
}

