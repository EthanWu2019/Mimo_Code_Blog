'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

const RIPPLE_MS = 1100;

// Solid colour for the expanding disc. Inside the disc the user sees
// this colour; outside, the live DOM (which has not yet been class-
// swapped). When the disc fully covers the viewport we swap the class
// and remove the overlay. Concurrent clicks create concurrent overlays
// (each on its own z-index); that's the ripple.
const THEME_FG: Record<Theme, string> = {
  dark: '#0a0a0b',
  light: '#fafafa',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);
  // Counter to assign z-index to concurrent ripples. Older ripples stay
  // animating underneath the newest, like stacked water-drops on a still
  // surface.
  const zCounter = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.add(initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const root = document.documentElement;
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    // Resolve origin from the live button rect. Percent of viewport.
    const btn = document.querySelector<HTMLElement>('[data-theme-toggle]');
    let xPct = 50;
    let yPct = 50;
    if (btn) {
      const r = btn.getBoundingClientRect();
      xPct = ((r.left + r.width / 2) / window.innerWidth) * 100;
      yPct = ((r.top + r.height / 2) / window.innerHeight) * 100;
    }

    // Brand new overlay per click — the "ripple" stack grows as the
    // user clicks faster. Each overlay animates independently to its
    // full coverage; later clicks always sit on top.
    const z = (zCounter.current = (zCounter.current + 1) % 8);
    const overlay = document.createElement('div');
    overlay.className = 'theme-ripple';
    overlay.style.setProperty('--ripple-x', `${xPct.toFixed(2)}%`);
    overlay.style.setProperty('--ripple-y', `${yPct.toFixed(2)}%`);
    overlay.style.zIndex = String(99990 + z);
    overlay.style.background = THEME_FG[nextTheme];
    document.body.appendChild(overlay);
    // Defer to next frame so the keyframe-from state is captured before
    // the animation actually starts. (Without this the first frame after
    // mounting is the keyframe's `from` state, but Chromium sometimes
    // composites the element unrolled instead.)
    requestAnimationFrame(() => {
      overlay.style.animation = `theme-ripple-grow ${RIPPLE_MS}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`;
    });

    // Commit the theme swap at the visual midpoint: when the disc covers
    // ~half the screen, switch the live DOM underneath. That way the
    // user never sees a sharp switch of OLD theme → NEW theme; what they
    // see is the disc gradually covering everything, and at the end the
    // disc colour matches the live DOM colour regardless of how many
    // quick clicks happened.
    window.setTimeout(() => {
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
    }, Math.round(RIPPLE_MS * 0.6));

    // Cleanup the overlay element after the ripple is fully complete.
    // Do NOT gate future clicks on this; concurrent ripples handle
    // themselves.
    window.setTimeout(() => {
      overlay.classList.add('theme-ripple--done');
      window.setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 100);
    }, RIPPLE_MS + 60);

    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
