'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/helpers';
import SidebarTooltip from '../SidebarTooltip';
import { NavItemProps } from './types';

const NavItem = memo(function NavItem({ href, icon: Icon, label, collapsed, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href));

  const inner = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
        collapsed ? 'justify-center' : '',
        isActive
          ? 'bg-primary/15 text-primary'
          : 'text-text-muted hover:bg-hover hover:text-text',
      )}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
      {!collapsed && isActive && (
        <ChevronRight size={14} className="ml-auto opacity-60" />
      )}
    </Link>
  );

  if (collapsed) return <SidebarTooltip label={label}>{inner}</SidebarTooltip>;
  return inner;
});

export default NavItem;
