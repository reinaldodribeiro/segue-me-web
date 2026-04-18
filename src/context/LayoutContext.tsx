'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';

interface LayoutContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
}

export const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

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

  return (
    <LayoutContext.Provider
      value={{ isSidebarCollapsed, toggleSidebar, isMobileDrawerOpen, openMobileDrawer, closeMobileDrawer }}
    >
      {children}
    </LayoutContext.Provider>
  );
};
