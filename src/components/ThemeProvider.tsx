'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: (x?: number, y?: number) => void;
}>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.add(initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;

    // Snapshot current state
    const snapshot = document.documentElement.cloneNode(true) as HTMLElement;
    snapshot.style.position = 'fixed';
    snapshot.style.inset = '0';
    snapshot.style.zIndex = '99998';
    snapshot.style.margin = '0';
    snapshot.style.width = '100vw';
    snapshot.style.height = '100vh';
    snapshot.style.overflow = 'hidden';
    snapshot.style.pointerEvents = 'none';
    snapshot.style.transition = 'clip-path 0.65s cubic-bezier(0.4, 0, 0.2, 1)';
    snapshot.classList.remove('dark', 'light');
    snapshot.classList.add(theme);

    // Switch theme on real DOM
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
    localStorage.setItem('theme', next);
    setTheme(next);

    // Clip snapshot so new theme is visible, then shrink clip to hide old
    const maxR = Math.sqrt(Math.max(cx, window.innerWidth - cx) ** 2 + Math.max(cy, window.innerHeight - cy) ** 2);
    snapshot.style.clipPath = `circle(${maxR}px at ${cx}px ${cy}px)`;

    document.body.appendChild(snapshot);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        snapshot.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
      });
    });

    setTimeout(() => snapshot.remove(), 700);
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
