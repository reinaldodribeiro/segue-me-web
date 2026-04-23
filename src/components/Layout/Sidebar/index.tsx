"use client";

import { memo, useMemo } from "react";
import { useLayout } from "@/hooks/useLayout";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn, storageUrl } from "@/utils/helpers";
import { LogOut, Sun, Moon, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import NavItem from "./NavItem";
import SidebarTooltip from "./SidebarTooltip";
import { NAV_SECTIONS, BOTTOM_NAV } from "./constants";
import { NavItemConfig } from "./types";

interface SidebarProps {
  onNavClick?: () => void;
}

const Sidebar: SafeFC<SidebarProps> = memo(({ onNavClick }) => {
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const { theme, toggleTheme } = useTheme();
  const { user, logOut } = useAuth();
  const { canAccess } = usePermissions();

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  const filteredSections = useMemo(
    () =>
      NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter((item: NavItemConfig) =>
          canAccess(item.href),
        ),
      })).filter((section) => section.items.length > 0),
    [canAccess],
  );

  const filteredBottomNav = useMemo(
    () => BOTTOM_NAV.filter((item: NavItemConfig) => canAccess(item.href)),
    [canAccess],
  );

  return (
    <aside className="h-full flex flex-col bg-panel border-r border-border overflow-hidden">
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0",
          isSidebarCollapsed ? "justify-center" : "",
        )}
      >
        {user?.parish ? (
          <>
            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              {user.parish.logo ? (
                <img
                  src={storageUrl(user.parish.logo) ?? ""}
                  alt={user.parish.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-primary text-xs font-bold">
                  {user.parish.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-text text-sm tracking-tight truncate">
                {user.parish.name}
              </span>
            )}
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            {!isSidebarCollapsed && (
              <span className="font-bold text-text text-sm tracking-tight">
                Segue-me
              </span>
            )}
          </>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {filteredSections.map((section) => (
          <div key={section.label ?? "_root"}>
            {section.label && !isSidebarCollapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted/60 select-none">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.href}
                  {...item}
                  collapsed={isSidebarCollapsed}
                  onClick={onNavClick}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider */}
      <div className="h-px bg-border mx-2" />

      {/* Bottom nav */}
      <nav className="px-2 py-3 space-y-0.5">
        {filteredBottomNav.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            collapsed={isSidebarCollapsed}
            onClick={onNavClick}
          />
        ))}
      </nav>

      {/* User / actions */}
      <div className="border-t border-border px-2 py-3 space-y-0.5">
        {/* Theme toggle */}
        {isSidebarCollapsed ? (
          <SidebarTooltip
            label={theme === "dark" ? "Modo claro" : "Modo escuro"}
          >
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-full rounded-lg px-3 py-2.5 text-text-muted hover:bg-hover hover:text-text transition-all"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </SidebarTooltip>
        ) : (
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-hover hover:text-text transition-all"
          >
            {theme === "dark" ? (
              <Sun size={18} className="shrink-0" />
            ) : (
              <Moon size={18} className="shrink-0" />
            )}
            <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
          </button>
        )}

        {/* Logout */}
        {isSidebarCollapsed ? (
          <SidebarTooltip label="Sair">
            <button
              onClick={logOut}
              className="flex items-center justify-center w-full rounded-lg px-3 py-2.5 text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <LogOut size={18} />
            </button>
          </SidebarTooltip>
        ) : (
          <button
            onClick={logOut}
            className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Sair</span>
          </button>
        )}

        {/* User info */}
        {!isSidebarCollapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1 rounded-lg bg-hover/50">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text truncate">
                {user?.name ?? "—"}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        ) : (
          <SidebarTooltip label={user?.name ?? "Perfil"}>
            <div className="flex justify-center py-1">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
            </div>
          </SidebarTooltip>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      <div className="border-t border-border p-2">
        {isSidebarCollapsed ? (
          <SidebarTooltip label="Expandir menu">
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-full rounded-lg px-3 py-2 text-text-muted hover:bg-hover hover:text-text transition-all"
            >
              <PanelLeftOpen size={16} />
            </button>
          </SidebarTooltip>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs font-medium text-text-muted hover:bg-hover hover:text-text transition-all"
          >
            <PanelLeftClose size={16} className="shrink-0" />
            <span>Recolher menu</span>
          </button>
        )}
      </div>
    </aside>
  );
});

export default Sidebar;
