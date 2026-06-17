'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

function getBgColor(x: number, y: number): string {
  const el = document.elementFromPoint(x, y);
  if (!el) return '#000000';
  let node: Element | null = el;
  while (node) {
    const bg = window.getComputedStyle(node).backgroundColor;
    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg;
    node = node.parentElement;
  }
  return '#000000';
}

function luminance(bg: string): number {
  const m = bg.match(/[\d.]+/g);
  if (!m || m.length < 3) return 0;
  return 0.299 * parseFloat(m[0]) + 0.587 * parseFloat(m[1]) + 0.114 * parseFloat(m[2]);
}

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef({ value: 1 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const colorRef = useRef<'dark' | 'light'>('dark');
  const debounceRef = useRef<number>(0);

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
    // Initial color
    const isDark = document.documentElement.classList.contains('dark');
    colorRef.current = isDark ? 'light' : 'dark';
    const applyColor = () => {
      const light = colorRef.current === 'light';
      if (dotRef.current) {
        dotRef.current.style.backgroundColor = light ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
        dotRef.current.style.boxShadow = light
          ? '0 0 8px 2px rgba(255,255,255,0.3)' : '0 0 4px rgba(0,0,0,0.15)';
      }
      if (glowRef.current) glowRef.current.style.opacity = light ? '1' : '0';
    };
    applyColor();

    // Sample background color at cursor position, with debounce
    const sample = () => {
      const { x, y } = posRef.current;
      if (x < 0 || y < 0) return;
      const bg = getBgColor(x, y);
      const lum = luminance(bg);
      const shouldBe = lum > 128 ? 'dark' : 'light'; // dark cursor on light bg, light cursor on dark bg
      if (shouldBe !== colorRef.current) {
        colorRef.current = shouldBe;
        applyColor();
      }
    };

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();

      // Debounced color sampling (every 300ms)
      const now = Date.now();
      if (now - debounceRef.current > 300) {
        debounceRef.current = now;
        sample();
      }
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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      }} />
    </>
  );
}
