'use client';

import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

interface ParishColorContextType {
  primaryColor: string | null;
  secondaryColor: string | null;
  previewActive: boolean;
  applyParishColors: (primary: string | null, secondary?: string | null) => void;
  previewColors: (primary: string, secondary?: string) => void;
  clearPreview: () => void;
}

export const ParishColorContext = createContext<ParishColorContextType | undefined>(undefined);

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

const PRIMARY_VARS = ['--primary', '--primary-hover', '--primary-active', '--primary-subtle-bg', '--focus-ring'];
const SECONDARY_VARS = ['--secondary', '--secondary-hover', '--secondary-subtle-bg'];

function applyToDom(primary: string | null, secondary: string | null) {
  const root = document.documentElement;
  const isDark = root.getAttribute('data-theme') === 'dark';

  // In dark mode, always remove parish overrides and let the CSS defaults take over
  if (isDark) {
    [...PRIMARY_VARS, ...SECONDARY_VARS].forEach((v) => root.style.removeProperty(v));
    return;
  }

  if (primary) {
    const [h, s, l] = hexToHsl(primary);
    root.style.setProperty('--primary', `hsl(${h}, ${s}%, ${l}%)`);
    root.style.setProperty('--primary-hover', `hsl(${h}, ${s}%, ${Math.max(l - 10, 10)}%)`);
    root.style.setProperty('--primary-active', `hsl(${h}, ${s}%, ${Math.max(l - 20, 5)}%)`);
    root.style.setProperty('--primary-subtle-bg', `hsla(${h}, ${s}%, ${l}%, 0.15)`);
    root.style.setProperty('--focus-ring', `hsla(${h}, ${s}%, ${l}%, 0.35)`);
  } else {
    PRIMARY_VARS.forEach((v) => root.style.removeProperty(v));
  }

  if (secondary) {
    const [h, s, l] = hexToHsl(secondary);
    root.style.setProperty('--secondary', `hsl(${h}, ${s}%, ${l}%)`);
    root.style.setProperty('--secondary-hover', `hsl(${h}, ${s}%, ${Math.max(l - 10, 10)}%)`);
    root.style.setProperty('--secondary-subtle-bg', `hsla(${h}, ${s}%, ${l}%, 0.15)`);
  } else {
    SECONDARY_VARS.forEach((v) => root.style.removeProperty(v));
  }
}

export const ParishColorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [primaryColor, setPrimaryColor] = useState<string | null>(null);
  const [secondaryColor, setSecondaryColor] = useState<string | null>(null);
  const [previewActive, setPreviewActive] = useState(false);
  const primaryRef = useRef<string | null>(null);
  const secondaryRef = useRef<string | null>(null);

  // Keep refs in sync so MutationObserver always has current values
  useEffect(() => {
    primaryRef.current = primaryColor;
    secondaryRef.current = secondaryColor;
  });

  useEffect(() => {
    const p = localStorage.getItem('parishPrimaryColor');
    const s = localStorage.getItem('parishSecondaryColor');
    if (p) setPrimaryColor(p);
    if (s) setSecondaryColor(s);
    if (p || s) applyToDom(p, s);

    // Re-apply (or clear) colors when the theme attribute changes
    const observer = new MutationObserver(() => {
      applyToDom(primaryRef.current, secondaryRef.current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const applyParishColors = useCallback((primary: string | null, secondary: string | null = null) => {
    setPrimaryColor(primary);
    setSecondaryColor(secondary);
    setPreviewActive(false);
    applyToDom(primary, secondary);
    if (primary) localStorage.setItem('parishPrimaryColor', primary);
    else localStorage.removeItem('parishPrimaryColor');
    if (secondary) localStorage.setItem('parishSecondaryColor', secondary);
    else localStorage.removeItem('parishSecondaryColor');
  }, []);

  const previewColors = useCallback((primary: string, secondary?: string) => {
    applyToDom(primary, secondary ?? null);
    setPreviewActive(true);
  }, []);

  const clearPreview = useCallback(() => {
    applyToDom(primaryColor, secondaryColor);
    setPreviewActive(false);
  }, [primaryColor, secondaryColor]);

  return (
    <ParishColorContext.Provider value={{
      primaryColor, secondaryColor, previewActive,
      applyParishColors, previewColors, clearPreview,
    }}>
      {children}
    </ParishColorContext.Provider>
  );
};
