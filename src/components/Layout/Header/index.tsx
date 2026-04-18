'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import { useLayout } from '@/hooks/useLayout';
import { useAuth } from '@/hooks/useAuth';
import { storageUrl } from '@/utils/helpers';

const Header: React.FC = React.memo(() => {
  const { openMobileDrawer } = useLayout();
  const { user } = useAuth();

  const parish = user?.parish;

  return (
    <header className="h-14 shrink-0 border-b border-border bg-panel flex items-center px-4 gap-3 lg:hidden">
      <button
        onClick={openMobileDrawer}
        className="p-2 rounded-lg text-text-muted hover:bg-hover hover:text-text transition-all"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {parish ? (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
            {parish.logo ? (
              <img
                src={storageUrl(parish.logo) ?? ""}
                alt={parish.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-primary text-[10px] font-bold">
                {parish.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-text truncate">{parish.name}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">S</span>
          </div>
          <span className="text-sm font-semibold text-text">Segue-me</span>
        </div>
      )}
    </header>
  );
});

export default Header;
