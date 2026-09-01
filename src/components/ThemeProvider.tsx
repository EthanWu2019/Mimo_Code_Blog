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

const ANIM_MS = 600;
// Color tokens for the overlay backdrop. The overlay is the OLD theme's
// representative color — only visible OUTSIDE the growing circle, where it's
// destined to be covered anyway.
const OLD_THEME_BG: Record<Theme, string> = {
  dark: '#0a0a0b',
  light: '#fafafa',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  const animatingRef = useRef(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.add(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    // Lazy-create the overlay once and reuse across toggles.
    if (typeof document === 'undefined') return;
    if (!overlayRef.current) {
      const el = document.createElement('div');
      el.id = 'theme-toggle-overlay';
      el.style.cssText =
        'position:fixed;inset:0;z-index:99999;pointer-events:none;' +
        'background:transparent;will-change:mask-image,-webkit-mask-image;' +
        'mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;';
      // Default mask paints the entire element transparent (no mask shape) →
      // it's invisible until we set --tt-r to drive the radius.
      document.body.appendChild(el);
      overlayRef.current = el;
    }
  }, []);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    if (animatingRef.current) return;

    const cx = Math.round(x ?? window.innerWidth / 2);
    const cy = Math.round(y ?? window.innerHeight / 2);

    const w = window.innerWidth;
    const h = window.innerHeight;
    // Diagonal from origin to farthest corner — guarantees full coverage at end.
    const maxR = Math.ceil(Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)));

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    animatingRef.current = true;

    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

    const overlay = overlayRef.current;
    if (!overlay) {
      // Pathological — fall back to a plain class swap.
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      animatingRef.current = false;
      return;
    }

    // Paint the overlay as the *old* theme background OUTSIDE the masked circle.
    // Where the mask is transparent (inside the circle), the overlay is invisible
    // and the user sees the real DOM — which we are about to swap to the new theme.
    overlay.style.background = OLD_THEME_BG[theme];
    overlay.style.setProperty('--tt-x', `${cx}px`);
    overlay.style.setProperty('--tt-y', `${cy}px`);
    overlay.style.setProperty('--tt-max', `${maxR}px`);

    // Re-arm the CSS animation. Force a reflow before re-adding the class,
    // otherwise back-to-back toggles skip the keyframe restart.
    overlay.classList.remove('theme-overlay--play');
    void overlay.offsetWidth;
    overlay.classList.add('theme-overlay--play');

    // Commit the class change so the real DOM underneath is the NEW theme.
    // Visually: at this instant, the overlay's mask is still ~0 radius, so
    // the user is still looking at the OLD theme through it. As the mask
    // circle grows, more and more of the OLD overlay (color) is hidden,
    // revealing the NEW-themed page underneath.
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nextTheme);
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);

    // Cleanup lock after the anim ends. We can rely on either animationend or
    // the timeout, whichever fires first.
    const done = () => {
      overlay.classList.remove('theme-overlay--play');
      animatingRef.current = false;
    };
    window.setTimeout(done, ANIM_MS + 60);
    overlay.addEventListener('animationend', done, { once: true });
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
