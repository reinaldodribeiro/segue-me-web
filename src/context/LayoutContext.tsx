'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) setIsSidebarCollapsed(JSON.parse(saved));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
      return next;
    });
  }, []);

  const openMobileDrawer = useCallback(() => setIsMobileDrawerOpen(true), []);
  const closeMobileDrawer = useCallback(() => setIsMobileDrawerOpen(false), []);

  const valueData: LayoutContextData = useMemo(
    () => ({ isSidebarCollapsed, toggleSidebar, isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer }),
    [isSidebarCollapsed, toggleSidebar, isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer],
  );

  return (
    <LayoutContext.Provider value={valueData}>
      {children}
    </LayoutContext.Provider>
  );
};
