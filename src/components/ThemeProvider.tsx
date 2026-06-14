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

    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxRadius = Math.ceil(
      Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2)
    );

    const newTheme = theme === 'dark' ? 'light' : 'dark';
    const isLightToDark = theme === 'light';

    if (document.startViewTransition) {
      isAnimatingRef.current = true;

      // 白切黑时添加反转类
      if (isLightToDark) {
        document.documentElement.classList.add('theme-toggle-reverse');
      }

      const transition = document.startViewTransition(() => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      });

      transition.ready.then(() => {
        if (isLightToDark) {
          // 白切黑：旧主题（白色）在上层，从全屏收缩到 0
          document.documentElement.animate(
            {
              clipPath: [
                `circle(${maxRadius}px at ${cx}px ${cy}px)`,
                `circle(0px at ${cx}px ${cy}px)`,
              ],
            },
            {
              duration: 500,
              easing: 'cubic-bezier(0.55, 0.06, 0.75, 0.52)',
              pseudoElement: '::view-transition-old(root)',
            }
          );
        } else {
          // 黑切白：新主题（白色）在上层，从 0 扩大到全屏
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${cx}px ${cy}px)`,
                `circle(${maxRadius}px at ${cx}px ${cy}px)`,
              ],
            },
            {
              duration: 500,
              easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        }
      });

      transition.finished.then(() => {
        // 延迟移除反转类，避免闪烁
        setTimeout(() => {
          document.documentElement.classList.remove('theme-toggle-reverse');
          isAnimatingRef.current = false;
        }, 50);
      });
    } else {
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
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
