'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'dark' | 'light';

// View Transitions API 类型声明
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

    // 计算从点击位置到屏幕四角的最大距离
    const maxRadius = Math.ceil(
      Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2)
    );

    const newTheme = theme === 'dark' ? 'light' : 'dark';

    if (document.startViewTransition) {
      isAnimatingRef.current = true;

      // 启动 View Transition - 自动捕获新旧快照
      const transition = document.startViewTransition(() => {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(newTheme);
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
      });

      // 当 transition 准备好后，执行 clip-path 动画
      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${cx}px ${cy}px)`,           // 起点：0半径的圆
              `circle(${maxRadius}px at ${cx}px ${cy}px)`, // 终点：覆盖全屏的圆
            ],
          },
          {
            duration: 500,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            pseudoElement: '::view-transition-new(root)',  // 作用于新视图
          }
        );
      });

      transition.finished.then(() => {
        isAnimatingRef.current = false;
      });
    } else {
      // 降级处理：不支持 View Transitions API 的浏览器
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
