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
// The NEW theme's representative color painted on the expanding overlay.
// Where the overlay is visible (inside a growing circle starting at the
// click point), the user sees this NEW color. Where the overlay is hidden
// (outside the circle, until it grows past), the user sees the OLD themed
// real page underneath.
const NEW_THEME_BG: Record<Theme, string> = {
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

  // Lazy-create the overlay on first user interaction. Creating it eagerly
  // via a useEffect ran into the case where the user can click the toggle
  // before React commits the effect — resulting in a missing overlay and a
  // blank screen. Creating on-demand guarantees it exists before we animate.
  const ensureOverlay = useCallback((): HTMLDivElement => {
    if (overlayRef.current && overlayRef.current.isConnected) {
      return overlayRef.current;
    }
    const el = document.createElement('div');
    el.id = 'theme-toggle-overlay';
    el.className = 'theme-toggle-overlay';
    document.body.appendChild(el);
    overlayRef.current = el;
    return el;
  }, []);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    if (animatingRef.current) return;

    const cx = Math.round(x ?? window.innerWidth / 2);
    const cy = Math.round(y ?? window.innerHeight / 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Diagonal distance from origin to the farthest corner — guarantees the
    // expanding circle fully covers the viewport by end of animation.
    const maxR = Math.ceil(Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)));

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    animatingRef.current = true;

    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

    const overlay = ensureOverlay();
    overlay.style.setProperty('--tt-x', `${cx}px`);
    overlay.style.setProperty('--tt-y', `${cy}px`);
    overlay.style.setProperty('--tt-max', `${maxR}px`);
    // Paint the OVERLAY as the NEW theme's background color. Inside the
    // growing circle, the user sees this NEW color. Outside, they see the
    // real page still in the OLD theme (we have NOT yet switched the class).
    overlay.style.backgroundColor = NEW_THEME_BG[nextTheme];

    // Re-arm the CSS keyframe animation. The standard incantation:
    // remove the .play class, force a reflow, then re-add it so the
    // browser restarts the keyframe from the FROM state.
    overlay.classList.remove('theme-overlay--play');
    void overlay.offsetWidth;
    overlay.classList.add('theme-overlay--play');

    // The class on <html> stays on the OLD theme during the animation so
    // that "outside the circle" really is the OLD-themed real page. We
    // commit the switch only when the overlay has fully covered the
    // viewport — see finalize() below.
    const finalize = () => {
      // Now the real page (still OLD theme) is fully covered by the
      // NEW-colored overlay. Swapping classes flips the underlying page
      // to NEW theme, then we remove the .play class — the overlay's
      // animation has been `forwards` and clipped the whole viewport,
      // so snapping back to clip-path: circle(0) at this moment would
      // expose the OLD-themed page through the now-no-longer-painted
      // overlay. To avoid a flash, we first remove the background-color
      // and remove the overlay entirely at the same instant — the snap
      // from circle(maxR) [covering all] back to circle(0) [nothing]
      // is irrelevant because we delete the element first.
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);

      // Hide overlay for next toggle restart; force reflow on next use.
      overlay.classList.remove('theme-overlay--play');
      // Reset to default (invisible) clip-path so the element is invisible
      // before the next animation. Setting background-color to transparent
      // ensures even if the element paints a frame before cleanup it shows
      // nothing.
      overlay.style.backgroundColor = 'transparent';
      animatingRef.current = false;
    };

    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      finalize();
      overlay.removeEventListener('animationend', release);
    };
    window.setTimeout(release, ANIM_MS + 80);
    overlay.addEventListener('animationend', release, { once: true });
  }, [theme, ensureOverlay]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
