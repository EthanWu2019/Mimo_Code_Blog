'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'dark' | 'light';

interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition;
}

interface ViewTransition {
  ready: Promise<void>;
  finished: Promise<void>;
}

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
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.add(initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    if (isAnimatingRef.current) return;

    // 1. Compute origin in CSS px relative to viewport (button center if provided, else viewport center)
    const cx = Math.round(x ?? window.innerWidth / 2);
    const cy = Math.round(y ?? window.innerHeight / 2);

    // 2. Compute the maximum radius needed to cover any corner from the origin.
    //    viewport width/height at the time of click — stable for the duration of the transition.
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxR = Math.ceil(Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)));

    const newTheme = theme === 'dark' ? 'light' : 'dark';
    const isLightToDark = theme === 'light';

    // 3. Persist the origin + radius to CSS custom properties on <html>.
    //    The View Transition pseudo-elements (::view-transition-old/new(root))
    //    are position:fixed inset:0, so `var(--theme-tx)` / `var(--theme-ty)`
    //    resolve in viewport pixel space — exactly the coordinates of the click.
    //    CSS @keyframes (`theme-expand` / `theme-recede`) read these directly
    //    — no further coordination is needed inside the startViewTransition callback.
    const root = document.documentElement;
    root.style.setProperty('--theme-tx', `${cx}px`);
    root.style.setProperty('--theme-ty', `${cy}px`);
    root.style.setProperty('--theme-tmax', `${maxR}px`);
    // Toggle the direction marker so CSS picks the right easing branch.
    root.classList.toggle('theme-toggle-reverse', isLightToDark);

    // 4. If the browser supports View Transitions, drive everything via CSS @keyframes.
    if (document.startViewTransition) {
      isAnimatingRef.current = true;

      // Notify cursor component to hide before snapshot.
      document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

      const transition = document.startViewTransition(() => {
        root.classList.remove('dark', 'light');
        root.classList.add(newTheme);
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      });

      transition.finished.then(() => {
        requestAnimationFrame(() => {
          root.classList.remove('theme-toggle-reverse');
          isAnimatingRef.current = false;
        });
      });
    } else {
      // Fallback: no animation, just swap classes.
      root.classList.remove('dark', 'light');
      root.classList.add(newTheme);
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
