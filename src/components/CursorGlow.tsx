'use client';

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

function getVisualBrightness(x: number, y: number): number {
  const el = document.elementFromPoint(x, y);
  if (!el) return 0;
  const isDarkMode = document.documentElement.classList.contains('dark');

  let node: Element | null = el;
  while (node) {
    const cs = window.getComputedStyle(node);
    const bg = cs.backgroundColor;
    const hasGlass = cs.backdropFilter !== 'none' && cs.backdropFilter !== '';

    if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
      const m = bg.match(/[\d.]+/g);
      if (m && m.length >= 4) {
        const r = parseFloat(m[0]);
        const g = parseFloat(m[1]);
        const b = parseFloat(m[2]);
        const a = parseFloat(m[3]);

        // Glass element with low alpha — its visual color depends on the theme
        if (hasGlass && a < 0.15) {
          // Dark mode: glass over dark bg → appears dark
          // Light mode: glass over light bg → appears light
          return isDarkMode ? 20 : 220;
        }

        // Composite over the theme background
        const bgR = isDarkMode ? 10 : 250;
        const bgG = isDarkMode ? 10 : 250;
        const bgB = isDarkMode ? 12 : 250;
        const finalR = r * a + bgR * (1 - a);
        const finalG = g * a + bgG * (1 - a);
        const finalB = b * a + bgB * (1 - a);
        return 0.299 * finalR + 0.587 * finalG + 0.114 * finalB;
      }
      // Opaque color
      if (m && m.length >= 3) {
        return 0.299 * parseFloat(m[0]) + 0.587 * parseFloat(m[1]) + 0.114 * parseFloat(m[2]);
      }
    }
    node = node.parentElement;
  }
  // No background found — use theme
  return isDarkMode ? 10 : 240;
}

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef({ value: 0.5 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const colorRef = useRef<'dark' | 'light'>('dark');
  const clickableRef = useRef(false);
  const debounceRef = useRef<number>(0);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      const s = scaleRef.current.value;
      if (glowRef.current) glowRef.current.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px) scale(${s})`;
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const applyColor = () => {
      if (!dotRef.current) return;
      if (clickableRef.current) {
        // Clickable element: violet accent
        dotRef.current.style.backgroundColor = 'rgba(139, 92, 246, 0.9)';
        dotRef.current.style.boxShadow = '0 0 8px 2px rgba(139, 92, 246, 0.4)';
      } else {
        const light = colorRef.current === 'light';
        dotRef.current.style.backgroundColor = light ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
        dotRef.current.style.boxShadow = light
          ? '0 0 8px 2px rgba(255,255,255,0.3)' : '0 0 4px rgba(0,0,0,0.15)';
      }
      if (glowRef.current) glowRef.current.style.opacity = colorRef.current === 'light' && !clickableRef.current ? '1' : '0';
    };

    // Detect clickable elements
    const isClickable = (el: Element | null): boolean => {
      if (!el) return false;
      const tag = el.tagName;
      if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
      if (el.getAttribute('role') === 'button' || el.getAttribute('onclick')) return true;
      if (window.getComputedStyle(el).cursor === 'pointer') return true;
      return false;
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const clickable = isClickable(target) || isClickable(target.closest('a, button, [role="button"]'));
      if (clickable !== clickableRef.current) {
        clickableRef.current = clickable;
        applyColor();
      }
    };

    document.addEventListener('mouseover', handleOver, { passive: true });

    // Initial
    colorRef.current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyColor();

    // Brief hide on light→dark transition
    const onThemeToggle = () => {
      if (!document.documentElement.classList.contains('dark')) {
        if (dotRef.current) dotRef.current.style.opacity = '0';
        setTimeout(() => { if (dotRef.current) dotRef.current.style.opacity = '1'; }, 80);
      }
    };
    document.addEventListener('hermes:theme-toggle', onThemeToggle);

    // Re-sample on theme change
    const observer = new MutationObserver(() => {
      setTimeout(() => {
        const { x, y } = posRef.current;
        if (x > 0 && y > 0) {
          const lum = getVisualBrightness(x, y);
          colorRef.current = lum > 128 ? 'dark' : 'light';
          applyColor();
        }
      }, 100);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Real-time sampling
    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();

      const now = Date.now();
      if (now - debounceRef.current > 300) {
        debounceRef.current = now;
        const lum = getVisualBrightness(e.clientX, e.clientY);
        const shouldBe = lum > 128 ? 'dark' : 'light';
        if (shouldBe !== colorRef.current) {
          colorRef.current = shouldBe;
          applyColor();
        }
      }
    };

    const handleDown = () => {
      isDownRef.current = true;
      gsap.to(scaleRef.current, { value: 1, duration: 0.15, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
    };
    const handleUp = () => {
      if (!isDownRef.current) return;
      isDownRef.current = false;
      gsap.to(scaleRef.current, { value: 0.5, duration: 0.6, ease: 'elastic.out(1.2, 0.3)', overwrite: true, onUpdate: scheduleUpdate });
    };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('hermes:theme-toggle', onThemeToggle);
      document.removeEventListener('mouseover', handleOver);
      observer.disconnect();
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
        position: 'fixed', top: 0, left: 0, width: 20, height: 20,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 201,
        willChange: 'transform', backgroundColor: 'rgba(0,0,0,0.6)',
        transform: 'translate(-100px, -100px) scale(0.5)', transformOrigin: 'center center',
        boxShadow: '0 0 4px rgba(0,0,0,0.15)',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      }} />
    </>
  );
}
