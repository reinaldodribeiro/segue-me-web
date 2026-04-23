'use client';

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextData {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('theme') as Theme | null) : null;
    const initial = saved ?? 'light';
    setThemeState(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => setThemeState(newTheme), []);
  const toggleTheme = useCallback(() => setThemeState(prev => prev === 'light' ? 'dark' : 'light'), []);

  const valueData: ThemeContextData = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={valueData}>
      {children}
    </ThemeContext.Provider>
  );
};
