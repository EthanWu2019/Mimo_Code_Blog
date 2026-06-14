'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'dark' | 'light';

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
    isAnimatingRef.current = true;

    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxRadius = Math.ceil(
      Math.sqrt(Math.max(cx, w - cx) ** 2 + Math.max(cy, h - cy) ** 2)
    );

    const currentTheme = theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // 1. 先创建当前主题的快照（不切换 DOM）
    const snapshot = document.documentElement.cloneNode(true) as HTMLElement;
    snapshot.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99998;
      margin: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      pointer-events: none;
    `;
    snapshot.classList.remove('dark', 'light');
    snapshot.classList.add(currentTheme);
    document.body.appendChild(snapshot);

    // 2. 切换真实 DOM 的主题
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
    setTheme(newTheme);

    // 3. 执行动画
    if (currentTheme === 'dark') {
      // 黑切白：快照（黑色）从全屏收缩到 0，露出下面的白色
      snapshot.style.clipPath = `circle(${maxRadius}px at ${cx}px ${cy}px)`;
      snapshot.style.transition = 'clip-path 0.5s cubic-bezier(0.55, 0.06, 0.75, 0.52)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          snapshot.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
        });
      });
    } else {
      // 白切黑：快照（白色）从 0 扩大到全屏，覆盖下面的黑色
      snapshot.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
      snapshot.style.transition = 'clip-path 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          snapshot.style.clipPath = `circle(${maxRadius}px at ${cx}px ${cy}px)`;
        });
      });
    }

    // 4. 动画结束后移除快照
    setTimeout(() => {
      snapshot.remove();
      isAnimatingRef.current = false;
    }, 550);
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
