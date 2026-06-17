'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const [isDark, setIsDark] = useState(false);
  const [visible, setVisible] = useState(false);

  // Detect dark mode and observe changes
  useEffect(() => {
    const el = document.documentElement;
    setIsDark(el.classList.contains('dark'));

    const observer = new MutationObserver(() => {
      setIsDark(el.classList.contains('dark'));
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sync cursor position via rAF
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x - 200}px, ${y - 200}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      scheduleUpdate();
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [visible, scheduleUpdate]);

  const glowOpacity = isDark && visible ? 1 : 0;
  const dotOpacity = visible ? 1 : 0;

  return (
    <>
      {/* Glow – dark mode only */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 400,
          height: 400,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 50,
          willChange: 'transform',
          mixBlendMode: 'screen',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 40%, transparent 70%)',
          opacity: glowOpacity,
          transition: 'opacity 0.25s ease',
          transform: 'translate(-100px, -100px)',
        }}
      />

      {/* Cursor dot */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isDark ? 6 : 4,
          height: isDark ? 6 : 4,
          marginTop: isDark ? -3 : -2,
          marginLeft: isDark ? -3 : -2,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 51,
          willChange: 'transform',
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.9)'
            : 'rgba(0,0,0,0.4)',
          opacity: dotOpacity,
          transition: 'opacity 0.2s ease, background-color 0.3s ease, width 0.3s ease, height 0.3s ease',
          transform: 'translate(-100px, -100px)',
          boxShadow: isDark ? '0 0 6px rgba(255,255,255,0.4)' : 'none',
        }}
      />
    </>
  );
}
