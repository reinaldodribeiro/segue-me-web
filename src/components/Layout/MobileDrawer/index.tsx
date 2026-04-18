'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLayout } from '@/hooks/useLayout';
import { Sidebar } from '@/components/Layout/Sidebar';

export const MobileDrawer: React.FC = () => {
  const { isMobileDrawerOpen, closeMobileDrawer } = useLayout();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMobileDrawer(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeMobileDrawer]);

  if (!isMobileDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeMobileDrawer}
      />

      {/* Drawer */}
      <div className="absolute inset-y-0 left-0 w-72 bg-panel shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
        <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-bold text-text text-sm tracking-tight">Segue-me</span>
          </div>
          <button
            onClick={closeMobileDrawer}
            className="p-2 rounded-lg text-text-muted hover:bg-hover hover:text-text transition-all"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Sidebar onNavClick={closeMobileDrawer} />
        </div>
      </div>
    </div>
  );
};
