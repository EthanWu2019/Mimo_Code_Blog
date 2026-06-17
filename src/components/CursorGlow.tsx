'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${x - 50}px, ${y - 50}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.left = `${x}px`;
        dotRef.current.style.top = `${y}px`;
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const el = document.documentElement;
    const isDark = () => el.classList.contains('dark');

    const applyTheme = () => {
      const dark = isDark();
      if (glowRef.current) {
        glowRef.current.style.opacity = dark ? '1' : '0';
      }
      if (dotRef.current) {
        dotRef.current.style.backgroundColor = dark
          ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
        dotRef.current.style.boxShadow = dark
          ? '0 0 8px 2px rgba(255,255,255,0.3), 0 0 16px rgba(255,255,255,0.08)'
          : '0 0 4px rgba(0,0,0,0.15)';
      }
    };

    applyTheme();
    const observer = new MutationObserver(applyTheme);
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
    };

    const handleDown = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, {
        scale: 2,
        duration: 0.15,
        ease: 'power2.out',
      });
    };

    const handleUp = () => {
      if (!dotRef.current) return;
      gsap.to(dotRef.current, {
        scale: 1,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.3)',
      });
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
      {/* Glow — small focused light */}
      <div
        ref={glowRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 100,
          height: 100,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 50,
          willChange: 'transform',
          mixBlendMode: 'screen',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          transform: 'translate(-100px, -100px)',
        }}
      />

      {/* Cursor dot — GSAP elastic click */}
      <div
        ref={dotRef}
        aria-hidden
        style={{
          position: 'fixed',
          width: 10,
          height: 10,
          marginTop: -5,
          marginLeft: -5,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 51,
          willChange: 'transform, left, top',
          backgroundColor: 'rgba(0,0,0,0.6)',
          transform: 'translate(-100px, -100px) scale(1)',
          boxShadow: '0 0 4px rgba(0,0,0,0.15)',
        }}
      />
    </>
  );
}
