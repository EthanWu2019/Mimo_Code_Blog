'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (x?: number, y?: number) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

interface VTDocument {
  startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
}

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
    const doc = document as unknown as VTDocument;
    const root = document.documentElement;
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    // Always persist coords to root CSS vars.  The CSS animation reads them.
    if (typeof x === 'number' && typeof y === 'number') {
      root.style.setProperty('--tt-x', `${x}px`);
      root.style.setProperty('--tt-y', `${y}px`);
    }

    // Hint CursorGlow to fade out for the duration.
    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

    if (!doc.startViewTransition) {
      // No-op fallback: just flip the class.
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      return;
    }

    // The transition:
    //   1. Captures OLD-theme full DOM screenshot into ::view-transition-old(root).
    //   2. Runs the callback, which swaps the .dark/.light class on <html>.
    //   3. Captures NEW-theme full DOM screenshot into ::view-transition-new(root).
    //   4. Plays CSS animations on the pseudo layers for the duration.
    //
    // Our CSS animates ::view-transition-new(root) with clip-path: circle(0) → circle(200%)
    // at the click point. ::view-transition-old(root) is unanimated — it stays full-screen
    // visible while the new layer is clipped to a small dot at t=0, then expands.
    // Net visual: the new theme reveals itself through a growing circular window,
    // centered on the click point. The OLD snapshot is gone outside that circle.
    doc.startViewTransition(() => {
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
    });
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
