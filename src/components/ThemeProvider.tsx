'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.classList.add(initial);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback((x?: number, y?: number) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    const cx = x ?? window.innerWidth / 2;
    const cy = y ?? window.innerHeight / 2;

    // 1. 先切换真实 DOM 的主题（此时用户还看不到，因为会被快照覆盖）
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(next);
    localStorage.setItem('theme', next);
    setTheme(next);

    // 2. 创建旧主题的快照覆盖在上面
    const snapshot = document.documentElement.cloneNode(true) as HTMLElement;
    snapshot.style.position = 'fixed';
    snapshot.style.inset = '0';
    snapshot.style.zIndex = '99998';
    snapshot.style.margin = '0';
    snapshot.style.width = '100vw';
    snapshot.style.height = '100vh';
    snapshot.style.overflow = 'hidden';
    snapshot.style.pointerEvents = 'none';
    snapshot.classList.remove('dark', 'light');
    snapshot.classList.add(theme); // 旧主题

    // 3. 快照从全屏开始，逐渐缩小到点击位置（露出下面的新主题）
    const maxR = Math.sqrt(Math.max(cx, window.innerWidth - cx) ** 2 + Math.max(cy, window.innerHeight - cy) ** 2);
    snapshot.style.clipPath = `circle(${maxR}px at ${cx}px ${cy}px)`;
    snapshot.style.transition = 'clip-path 0.65s cubic-bezier(0.4, 0, 0.2, 1)';

    document.body.appendChild(snapshot);

    // 4. 下一帧开始收缩动画
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        snapshot.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
      });
    });

    // 5. 动画结束后移除快照
    setTimeout(() => snapshot.remove(), 700);
  }, [theme]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
