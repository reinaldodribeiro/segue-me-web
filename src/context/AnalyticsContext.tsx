'use client';

import React, {
  createContext,
  useContext,
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

const AnalyticsContext = createContext<AnalyticsContextData | null>(null);

/* ─── provider ───────────────────────────────────────────────────── */

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const filter = useParishFilter();
  const { scopedParishIds } = filter;
  const queryClient = useQueryClient();

  const sortedIds = [...scopedParishIds].sort();
  const { data: engagement = null, isLoading: loadingEngagement } = useEngagementReport(scopedParishIds);

  function refreshEngagement() {
    queryClient.invalidateQueries({ queryKey: queryKeys.engagement.report(sortedIds) });
  }

  return (
    <AnalyticsContext.Provider
      value={{ filter, engagement, loadingEngagement, refreshEngagement }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

/* ─── hook ───────────────────────────────────────────────────────── */

export function useAnalytics(): AnalyticsContextData {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used inside <AnalyticsProvider>');
  return ctx;
}
