'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const pressingRef = useRef(false);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x - 80}px, ${y - 80}px)`;
      }
      if (dotRef.current) {
        const s = pressingRef.current ? 1.8 : 1;
        dotRef.current.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    const isDark = () => el.classList.contains('dark');

    // Apply initial styles immediately
    const applyTheme = () => {
      const dark = isDark();
      if (glowRef.current) {
        glowRef.current.style.opacity = dark ? '1' : '0';
      }
      if (dotRef.current) {
        dotRef.current.style.backgroundColor = dark
          ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.5)';
        dotRef.current.style.boxShadow = dark
          ? '0 0 8px 2px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.1)'
          : '0 0 4px rgba(0,0,0,0.15)';
      }
    };

    applyTheme(); // Set correct colors on mount

    const observer = new MutationObserver(applyTheme);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
    };

    const handleDown = () => {
      pressingRef.current = true;
      if (dotRef.current) {
        dotRef.current.style.transition = 'opacity 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease, width 0.15s ease, height 0.15s ease';
      }
      scheduleUpdate();
    };

    const handleUp = () => {
      pressingRef.current = false;
      if (dotRef.current) {
        dotRef.current.style.transition = 'opacity 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease, width 0.4s cubic-bezier(0.34,1.56,0.64,1), height 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      }
      scheduleUpdate();
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate]);

  return (
    <>
      {/* Glow — dark mode light source, smaller */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 160,
          height: 160,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 50,
          willChange: 'transform',
          mixBlendMode: 'screen',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          transform: 'translate(-100px, -100px)',
        }}
      />

      {/* Cursor dot — instant tracking, no delay */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          marginTop: -5,
          marginLeft: -5,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 51,
          willChange: 'transform',
          backgroundColor: 'rgba(0,0,0,0.5)',
          // NO transition on transform — instant tracking
          transition: 'opacity 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease',
          transform: 'translate(-100px, -100px) scale(1)',
          boxShadow: '0 0 4px rgba(0,0,0,0.15)',
        }}
      />
    </>
  );
}
