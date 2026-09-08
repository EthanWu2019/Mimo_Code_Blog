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

      // Apply the new theme SYNCHRONOUSLY. Previously we deferred the class
      // swap until startViewTransition's callback ran, which made rapid
      // mashing of the toggle feel "throttled" (Chromium queues view
      // transitions: only one at a time, new ones wait for the prior to
      // finish). By swapping immediately, the click feels instant;
      // the view-transition (when it can run) is purely decorative.
      root.classList.remove('dark', 'light');
      root.classList.add(nextTheme);
      setTheme(nextTheme);
      localStorage.setItem('theme', nextTheme);
      document.dispatchEvent(new CustomEvent('hermes:theme-toggle'));

      // Resolve the clip-path origin (percent-based) for the reveal anim.
      const origin = resolveOrigin();
      if (!origin || !doc.startViewTransition) return;

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

      const vt = doc.startViewTransition(() => {
        // empty callback — the snapshot is taken here, the swap already
        // happened synchronously above. This produces a "new" snapshot
        // that the keyframe reveal animates over.
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
