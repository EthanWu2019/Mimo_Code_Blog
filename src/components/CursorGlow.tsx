'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef({ value: 1 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const trackRef = useRef<number | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      const s = scaleRef.current.value;
      if (glowRef.current) glowRef.current.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x - 5}px, ${y - 5}px) scale(${s})`;
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const el = document.documentElement;

    const setDotColor = (dark: boolean) => {
      if (!dotRef.current) return;
      dotRef.current.style.backgroundColor = dark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
      dotRef.current.style.boxShadow = dark
        ? '0 0 8px 2px rgba(255,255,255,0.3)' : '0 0 4px rgba(0,0,0,0.15)';
    };

    const setGlow = (dark: boolean) => {
      if (glowRef.current) glowRef.current.style.opacity = dark ? '1' : '0';
    };

    // Initial
    const initDark = el.classList.contains('dark');
    setDotColor(initDark);
    setGlow(initDark);

    // Theme toggle event from ThemeProvider
    const onThemeToggle = () => {
      const dot = dotRef.current;
      if (!dot) return;

      // Step 1: Hide for 0.1s (kills the stuck dot on the button)
      dot.style.opacity = '0';

      // The click position is where the overlay circle starts
      const cx = posRef.current.x;
      const cy = posRef.current.y;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxR = Math.sqrt(vw * vw + vh * vh);
      const start = performance.now();

      // Step 2: After 0.1s, show and start position-based color tracking
      setTimeout(() => {
        dot.style.opacity = '1';
        // Turn on glow immediately for dark mode
        if (glowRef.current) glowRef.current.style.opacity = '1';

        // Cubic-bezier(0.76, 0, 0.24, 1) approximation
        const ease = (t: number) => {
          if (t < 0.5) return 4 * t * t * t;
          return 1 - Math.pow(-2 * t + 2, 3) / 2;
        };

        const tick = () => {
          const elapsed = performance.now() - start;
          const raw = Math.min(elapsed / 600, 1);
          const t = ease(raw);
          // Overlay shrinks from maxR to 0
          const r = maxR * (1 - t);

          const { x, y } = posRef.current;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

          if (dist < r) {
            // Inside shrinking light overlay → black cursor
            dot.style.backgroundColor = 'rgba(0,0,0,0.6)';
            dot.style.boxShadow = '0 0 4px rgba(0,0,0,0.15)';
          } else {
            // Outside, in dark theme → white cursor
            dot.style.backgroundColor = 'rgba(255,255,255,0.95)';
            dot.style.boxShadow = '0 0 8px 2px rgba(255,255,255,0.3)';
          }

          if (raw < 1) {
            trackRef.current = requestAnimationFrame(tick);
          } else {
            // Animation done → lock to dark mode
            setDotColor(true);
            trackRef.current = null;
          }
        };

        trackRef.current = requestAnimationFrame(tick);
      }, 100);
    };

    document.addEventListener('hermes:theme-toggle', onThemeToggle);

    // Fallback for non-View-Transition browsers
    const observer = new MutationObserver(() => {
      if (typeof document.startViewTransition !== 'function') {
        const dark = el.classList.contains('dark');
        setDotColor(dark);
        setGlow(dark);
      }
    });
    observer.observe(el, { attributes: true, attributeFilter: ['class'] });

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
    };
    const handleDown = () => {
      isDownRef.current = true;
      gsap.to(scaleRef.current, { value: 2, duration: 0.15, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
    };
    const handleUp = () => {
      if (!isDownRef.current) return;
      isDownRef.current = false;
      gsap.to(scaleRef.current, { value: 1, duration: 0.6, ease: 'elastic.out(1.2, 0.3)', overwrite: true, onUpdate: scheduleUpdate });
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('hermes:theme-toggle', onThemeToggle);
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (trackRef.current) cancelAnimationFrame(trackRef.current);
    };
  }, [scheduleUpdate]);

  return (
    <>
      <div ref={glowRef} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 50, height: 50,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 200,
        willChange: 'transform', mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
        opacity: 0, transition: 'opacity 0.3s ease', transform: 'translate(-100px, -100px)',
      }} />
      <div ref={dotRef} aria-hidden className="cursor-dot" style={{
        position: 'fixed', top: 0, left: 0, width: 10, height: 10,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 201,
        willChange: 'transform', backgroundColor: 'rgba(0,0,0,0.6)',
        transform: 'translate(-100px, -100px) scale(1)', transformOrigin: 'center center',
        boxShadow: '0 0 4px rgba(0,0,0,0.15)',
      }} />
    </>
  );
}
