import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { bacaPreferensiTema, simpanPreferensiTema, type TemaAplikasi } from './storage';

export interface ThemeContextValue {
  theme: TemaAplikasi;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: TemaAplikasi) => void;
}

const defaultThemeValue: ThemeContextValue = {
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {}
};

const ThemeContext = createContext<ThemeContextValue>(defaultThemeValue);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<TemaAplikasi>(() => bacaPreferensiTema());

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', theme === 'dark' ? '#0b1320' : '#123e6d');
      }
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((sebelumnya) => {
      const baru: TemaAplikasi = sebelumnya === 'dark' ? 'light' : 'dark';
      simpanPreferensiTema(baru);
      return baru;
    });
  }, []);

  const setTheme = useCallback((baru: TemaAplikasi) => {
    setThemeState(baru);
    simpanPreferensiTema(baru);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme
  }), [theme, toggleTheme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
