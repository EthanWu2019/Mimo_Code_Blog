'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (x?: number, y?: number) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

interface DocumentVT {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
}
interface ViewTransitionLike {
  ready: Promise<void>;
  finished: Promise<void>;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const animatingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.add(initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    if (animatingRef.current) return;

    // 1. Origin in viewport px — clicked SVG center.
    //    Defensive: the button may have CSS transitions that perturb rect.top on
    //    hover, so we DON'T read getBoundingClientRect on the live element.
    //    Instead, every click is the *current* runtime cursor position captured
    //    via event.clientX/Y upstream. We pull them from the explicit args here
    //    — and if absent, fall back to viewport center (e.g. keyboard shortcut).
    const cx = Math.round(x ?? window.innerWidth / 2);
    const cy = Math.round(y ?? window.innerHeight / 2);

    const doc = document as unknown as DocumentVT;
    if (!doc.startViewTransition) {
      // Graceful degrade: instant theme flip with no animation.
      const fallbackNext: Theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(fallbackNext);
      setTheme(fallbackNext);
      localStorage.setItem('theme', fallbackNext);
      return;
    }

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    animatingRef.current = true;

    // Cursor dot gets a visual hint that a transition is starting.
    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

    // 2. Geometry: the circle that "uncovers" the new theme must be large enough
    //    to swallow the entire viewport diagonally, otherwise the old theme
    //    bleeds through the corners.
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxR = Math.ceil(Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)));

    // 3. Publish origin to CSS so ::view-transition-old(root) can clip from it.
    const root = document.documentElement;
    root.style.setProperty('--tt-x', `${cx}px`);
    root.style.setProperty('--tt-y', `${cy}px`);
    root.style.setProperty('--tt-max', `${maxR}px`);

    // 4. Run the transition. Inside the callback we swap the class on <html> so
    //    Chromium captures the *new* theme into the NEW snapshot. Both snapshots
    //    are rendered as ::view-transition-old(root) / -new(root) pseudo layers.
    //    We disable the built-in group animation (replaced by our clipPath) and
    //    pare down the new layer to fully transparent so the old layer's clip
    //    animation IS the visible effect.
    const vt = doc.startViewTransition(() => {
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
    });

    vt.finished.finally(() => {
      // Always release the lock — animationend guards on rapid clicks.
      animatingRef.current = false;
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
