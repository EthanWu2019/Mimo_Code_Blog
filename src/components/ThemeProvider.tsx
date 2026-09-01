'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
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

  // The origin of the expanding circle is FIXED at the theme toggle button,
  // not where the user clicks.  This matches the visual intuition of a
  // single-purpose control: the button is the source of the reveal.
  //
  // We resolve the button's *visual* center every time the user clicks
  // (rare event), accounting for scroll position / dynamic layout.  We
  // write the result directly to the ::view-transition pseudo-element via
  // a one-shot injected <style> tag — guarantees the snapshot read picks
  // up the new value with no timing games.
  const resolveOrigin = useCallback(() => {
    const btn = document.querySelector<HTMLElement>('[data-theme-toggle]');
    if (!btn) return null;
    const r = btn.getBoundingClientRect();
    return {
      x: Math.round(r.left + r.width / 2),
      y: Math.round(r.top + r.height / 2),
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const doc = document as unknown as VTDocument;
    const root = document.documentElement;
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    // 1. Resolve origin from the live button rect.
    const origin = resolveOrigin();
    if (!origin) {
      // No button in DOM yet — just flip without anim.
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      return;
    }

    // 2. Inject a one-shot keyframe rule with literal pixel values that
        // exactly match the theme toggle button's center. The animation-name
        // in globals.css is "theme-reveal-new"; we override it here so the
        // pseudo-element runs OUR keyframe (whose clip-path centre uses the
        // literal button px coords) instead of the 50%-placeholder.
        const styleId = 'theme-origin-style';
        let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }
        styleEl.textContent =
          `@keyframes theme-reveal-new-px{` +
          `from{clip-path:circle(0% at ${origin.x}px ${origin.y}px);` +
          `-webkit-clip-path:circle(0% at ${origin.x}px ${origin.y}px)}` +
          `to{clip-path:circle(200% at ${origin.x}px ${origin.y}px);` +
          `-webkit-clip-path:circle(200% at ${origin.x}px ${origin.y}px)}` +
          `}` +
          `::view-transition-new(root){animation-name:theme-reveal-new-px !important;}`;

    // 3. Cursor dot gets the visual hint.
    document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

    // 4. Run the transition.
    if (!doc.startViewTransition) {
      // No-op fallback.
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      return;
    }

    const vt = doc.startViewTransition(() => {
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
    });

    // 5. Once the transition settles, drop the one-shot <style>. The CSS
    // keyframe in globals.css owns the animation; this injected rule only
    // seeds the `from` clip-path at the click origin so the expanding disc
    // starts at exactly the button center.
    vt.finished.finally(() => {
      if (styleEl && styleEl.parentNode) styleEl.textContent = '';
    });
  }, [theme, resolveOrigin]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
