<!-- mustard:generated at:2026-04-23T00:00:00Z role:ui -->

# Context Pattern Examples

## Simple context (ToastContext)
Ref: `src/context/ToastContext.tsx`
```tsx
'use client';
import React, { createContext, useCallback, useMemo, useState } from 'react';

export interface ToastContextData {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, variant = 'info', durationMs = 3500 }: ToastOptions) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ id, title, variant, durationMs }, ...prev].slice(0, 5));
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const valueData: ToastContextData = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return <ToastContext.Provider value={valueData}>{children}</ToastContext.Provider>;
};
```

## Context with localStorage persistence (LayoutContext)
Ref: `src/context/LayoutContext.tsx`
```tsx
export interface LayoutContextData {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

export const LayoutContext = createContext<LayoutContextData | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => { const next = !prev; localStorage.setItem('sidebarCollapsed', JSON.stringify(next)); return next; });
  }, []);
  const openMobileDrawer = useCallback(() => setIsMobileDrawerOpen(true), []);
  const closeMobileDrawer = useCallback(() => setIsMobileDrawerOpen(false), []);

  const valueData: LayoutContextData = useMemo(
    () => ({ isSidebarCollapsed, toggleSidebar, isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer }),
    [isSidebarCollapsed, toggleSidebar, isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer],
  );

  return <LayoutContext.Provider value={valueData}>{children}</LayoutContext.Provider>;
};
```

## Context wrapping TanStack Query (AnalyticsContext)
Ref: `src/context/AnalyticsContext.tsx`
```tsx
export interface AnalyticsContextData {
  filter: ParishFilterState;
  engagement: EngagementReportData | null;
  loadingEngagement: boolean;
  refreshEngagement: () => void;
}

export const AnalyticsContext = createContext<AnalyticsContextData | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const filter = useParishFilter();
  const queryClient = useQueryClient();
  const { data: engagement = null, isLoading: loadingEngagement } = useEngagementReport(filter.scopedParishIds);

  const refreshEngagement = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.engagement.report(filter.scopedParishIds) });
  }, [queryClient, filter.scopedParishIds]);

  const valueData: AnalyticsContextData = useMemo(
    () => ({ filter, engagement, loadingEngagement, refreshEngagement }),
    [filter, engagement, loadingEngagement, refreshEngagement],
  );

  return <AnalyticsContext.Provider value={valueData}>{children}</AnalyticsContext.Provider>;
}
```
