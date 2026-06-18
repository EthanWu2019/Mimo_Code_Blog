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
        const r = parseFloat(m[0]), g = parseFloat(m[1]), b = parseFloat(m[2]), a = parseFloat(m[3]);
        if (hasGlass && a < 0.15) return isDarkMode ? 20 : 220;
        const bgR = isDarkMode ? 10 : 250, bgG = isDarkMode ? 10 : 250, bgB = isDarkMode ? 12 : 250;
        return 0.299 * (r * a + bgR * (1 - a)) + 0.587 * (g * a + bgG * (1 - a)) + 0.114 * (b * a + bgB * (1 - a));
      }
      if (m && m.length >= 3) return 0.299 * parseFloat(m[0]) + 0.587 * parseFloat(m[1]) + 0.114 * parseFloat(m[2]);
    }
    node = node.parentElement;
  }
  return isDarkMode ? 10 : 240;
}

function isClickable(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return true;
  if (el.getAttribute('role') === 'button' || el.getAttribute('onclick')) return true;
  if (window.getComputedStyle(el).cursor === 'pointer') return true;
  return false;
}

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef({ value: 0.5 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const colorRef = useRef<'dark' | 'light'>('dark');
  const clickableRef = useRef(false);
  const debounceRef = useRef<number>(0);
  const ringAnimRef = useRef<gsap.core.Timeline | null>(null);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      const s = scaleRef.current.value;
      if (glowRef.current) glowRef.current.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
      if (dotRef.current) dotRef.current.style.transform = `translate(${x - 10}px, ${y - 10}px) scale(${s})`;
      if (ringRef.current) ringRef.current.style.transform = `translate(${x - 16}px, ${y - 16}px)`;
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const applyColor = () => {
      if (!dotRef.current) return;
      const light = colorRef.current === 'light';
      if (clickableRef.current) {
        // Warm amber on clickable
        dotRef.current.style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
        dotRef.current.style.boxShadow = '0 0 10px 2px rgba(245, 158, 11, 0.3)';
      } else {
        dotRef.current.style.backgroundColor = light ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.6)';
        dotRef.current.style.boxShadow = light
          ? '0 0 8px 2px rgba(255,255,255,0.3)' : '0 0 4px rgba(0,0,0,0.15)';
      }
      if (glowRef.current) glowRef.current.style.opacity = light && !clickableRef.current ? '1' : '0';
    };

    // Soft ripple ring animation
    const startRing = () => {
      if (!ringRef.current) return;
      stopRing();
      const tl = gsap.timeline({ repeat: -1, delay: 0.2 });
      tl.fromTo(ringRef.current,
        { scale: 0.6, opacity: 0.6 },
        { scale: 1.8, opacity: 0, duration: 1.2, ease: 'power2.out' }
      );
      ringAnimRef.current = tl;
      // Enlarge dot slightly
      gsap.to(scaleRef.current, { value: 0.65, duration: 0.3, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
    };

    const stopRing = () => {
      if (ringAnimRef.current) { ringAnimRef.current.kill(); ringAnimRef.current = null; }
      if (ringRef.current) { ringRef.current.style.opacity = '0'; ringRef.current.style.transform = 'translate(-100px,-100px) scale(0.6)'; }
      gsap.to(scaleRef.current, { value: 0.5, duration: 0.3, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
    };

    // Initial
    colorRef.current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyColor();

    const onThemeToggle = () => {
      if (!document.documentElement.classList.contains('dark')) {
        if (dotRef.current) dotRef.current.style.opacity = '0';
        setTimeout(() => { if (dotRef.current) dotRef.current.style.opacity = '1'; }, 80);
      }
    };
    document.addEventListener('hermes:theme-toggle', onThemeToggle);

    const observer = new MutationObserver(() => {
      setTimeout(() => {
        const { x, y } = posRef.current;
        if (x > 0 && y > 0) {
          colorRef.current = getVisualBrightness(x, y) > 128 ? 'dark' : 'light';
          applyColor();
        }
      }, 100);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleOver = (e: MouseEvent) => {
      const target = e.target as Element;
      const clickable = isClickable(target) || isClickable(target.closest('a, button, [role="button"]'));
      if (clickable !== clickableRef.current) {
        clickableRef.current = clickable;
        applyColor();
        clickable ? startRing() : stopRing();
      }
    };
    document.addEventListener('mouseover', handleOver, { passive: true });

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();
      const now = Date.now();
      if (now - debounceRef.current > 300) {
        debounceRef.current = now;
        if (!clickableRef.current) {
          colorRef.current = getVisualBrightness(e.clientX, e.clientY) > 128 ? 'dark' : 'light';
          applyColor();
        }
      }
    };

    const handleDown = () => {
      isDownRef.current = true;
      if (!clickableRef.current) gsap.to(scaleRef.current, { value: 1, duration: 0.15, ease: 'power2.out', overwrite: true, onUpdate: scheduleUpdate });
    };
    const handleUp = () => {
      if (!isDownRef.current) return;
      isDownRef.current = false;
      if (!clickableRef.current) gsap.to(scaleRef.current, { value: 0.5, duration: 0.6, ease: 'elastic.out(1.2, 0.3)', overwrite: true, onUpdate: scheduleUpdate });
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
      if (ringAnimRef.current) ringAnimRef.current.kill();
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
      {/* Ripple ring */}
      <div ref={ringRef} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 32, height: 32,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 200,
        willChange: 'transform, opacity',
        border: '1.5px solid rgba(245, 158, 11, 0.5)',
        opacity: 0, transform: 'translate(-100px, -100px) scale(0.6)',
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
