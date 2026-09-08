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

  // The origin of the expanding circle is fixed at the theme toggle button.
    // The reliable way to set it: read the button rect in *percent* of the
    // viewport, then write literal percent coords into the keyframe. CSS
    // clip-path on view-transition pseudo-elements in Chromium honours
    // percentages consistently; literal pixel values get scaled with the
    // group during the transition and end up at viewport centre. (That is
    // why every prior fix using px coordinates showed 'screen top centre'.)
    const resolveOrigin = useCallback(() => {
      const btn = document.querySelector<HTMLElement>('[data-theme-toggle]');
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      return {
        xPct: (cx / window.innerWidth) * 100,
        yPct: (cy / window.innerHeight) * 100,
      };
    }, []);

    const toggleTheme = useCallback(() => {
      const doc = document as unknown as VTDocument;
      const root = document.documentElement;
      const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

      // Update React state + persisted preference synchronously so the
      // button label and any themable UI reflect the click immediately.
      // The view-transition API call below is purely decorative; the
      // className swap happens inside its callback so Chromium's
      // capture/animate pipeline has a real "old" → "new" diff to reveal.
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

      // Resolve the clip-path origin (percent-based) for the reveal anim.
      const origin = resolveOrigin();
      if (!origin || !doc.startViewTransition) {
        // Reduced-motion / no-support fallback: imperative class swap,
        // no animation.
        root.classList.remove('dark', 'light');
        root.classList.add(nextTheme);
        return;
      }

      // Inject a one-shot keyframe so the new root pseudo-element reveals
      // from the toggle button. Percent is the only unit reliable for
      // view-transition clip-path in current Chromium — px gets re-scaled
      // with the group.
      const styleId = 'theme-origin-style';
      let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent =
        `@keyframes theme-reveal-new-px{` +
        `from{clip-path:circle(0% at ${origin.xPct.toFixed(2)}% ${origin.yPct.toFixed(2)}%)}` +
        `to  {clip-path:circle(200% at ${origin.xPct.toFixed(2)}% ${origin.yPct.toFixed(2)}%)}` +
        `}` +
        `::view-transition-new(root){animation-name:theme-reveal-new-px !important;}`;

      // The callback runs SYNCHRONOUSLY when startViewTransition is
      // called — Chromium captures the "old" snapshot before the cb and
      // the "new" one after. Doing the className swap here gives the
      // animation a real diff to reveal. setTheme() above already updated
      // React; the cb only needs to swap the DOM.
      const vt = doc.startViewTransition(() => {
        root.classList.remove('dark', 'light');
        root.classList.add(nextTheme);
      });
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
