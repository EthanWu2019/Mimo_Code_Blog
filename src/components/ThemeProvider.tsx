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

const ANIM_MS = 1500;

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

    const cx = Math.round(x ?? window.innerWidth / 2);
    const cy = Math.round(y ?? window.innerHeight / 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Diagonal from origin → farthest corner. Guarantees the circle sweeps the
    // entire viewport so the swap can be made invisibly at the end of the anim.
    const maxR = Math.ceil(Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)));

    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    animatingRef.current = true;

    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

    // Find or create the overlay element.
    let overlay = document.getElementById('theme-toggle-overlay') as HTMLDivElement | null;
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'theme-toggle-overlay';
      document.body.appendChild(overlay);
    }

    // Pick overlay color = NEW theme color. This way during the animation the
    // user sees the new color sweeping out from the click point.
    overlay.classList.toggle('theme-overlay--light', newTheme === 'light');
    overlay.classList.toggle('theme-overlay--dark', newTheme === 'dark');

    // Geometry: where the circle starts, and the radius it must reach.
    overlay.style.setProperty('--tt-x', `${cx}px`);
    overlay.style.setProperty('--tt-y', `${cy}px`);
    overlay.style.setProperty('--tt-max', `${maxR}px`);

    // Force reflow before re-arming the animation — without this a fast successive
    // toggle that hits while the overlay is still in its previous state would skip
    // the keyframe restart.
    overlay.classList.remove('theme-overlay--play');
    void overlay.offsetWidth;
    overlay.classList.add('theme-overlay--play');

    // The page underneath is still the OLD theme during the entire 1.5s.
    // Once the overlay has fully covered the screen, we swap the class so the
    // page underneath matches the overlay — then snap the overlay back to 0
    // radius and the user sees no visual change at all.
    const finalize = () => {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);

      // Reset overlay to radius 0 — invisible again — ready for next toggle.
      overlay?.classList.remove('theme-overlay--play');
      // No forced reflow needed here; the next toggle will do it.
      animatingRef.current = false;
    };

    const handle = window.setTimeout(finalize, ANIM_MS);

    // If something cancels the animation (tab switch, paused media query),
    // fall back via animationend so we never get stuck animating=true.
    const onEnd = () => {
      window.clearTimeout(handle);
      if (animatingRef.current) finalize();
      overlay?.removeEventListener('animationend', onEnd);
    };
    overlay.addEventListener('animationend', onEnd, { once: true });
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
