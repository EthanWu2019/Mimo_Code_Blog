'use client';

import { useEffect, useRef, useCallback } from 'react';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const isDarkRef = useRef(false);
  const pressingRef = useRef(false);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x - 120}px, ${y - 120}px)`;
      }
      if (dotRef.current) {
        const scale = pressingRef.current ? 1.8 : 1;
        dotRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    isDarkRef.current = el.classList.contains('dark');

    const observer = new MutationObserver(() => {
      isDarkRef.current = el.classList.contains('dark');
      // Update visibility
      if (glowRef.current) {
        glowRef.current.style.opacity = isDarkRef.current ? '1' : '0';
      }
      if (dotRef.current) {
        dotRef.current.style.backgroundColor = isDarkRef.current
          ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.5)';
        dotRef.current.style.boxShadow = isDarkRef.current
          ? '0 0 8px 2px rgba(255,255,255,0.3), 0 0 20px rgba(255,255,255,0.1)'
          : '0 0 4px rgba(0,0,0,0.15)';
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
    };

    const handleDown = () => {
      pressingRef.current = true;
      if (dotRef.current) {
        dotRef.current.style.transition = 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, background-color 0.3s ease';
      }
      scheduleUpdate();
    };

    const handleUp = () => {
      pressingRef.current = false;
      if (dotRef.current) {
        dotRef.current.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, background-color 0.3s ease';
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
      {/* Glow — dark mode light source */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 240,
          height: 240,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 50,
          willChange: 'transform',
          mixBlendMode: 'screen',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.02) 60%, transparent 80%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          transform: 'translate(-100px, -100px)',
        }}
      />

      {/* Cursor dot with click animation */}
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
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease, background-color 0.3s ease',
          transform: 'translate(-100px, -100px) scale(1)',
          boxShadow: '0 0 4px rgba(0,0,0,0.15)',
        }}
      />
    </>
  );
}
