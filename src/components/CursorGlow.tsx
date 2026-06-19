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

function isTextElement(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  // Form inputs (excluding buttons/checkboxes/radio)
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const input = el as HTMLInputElement;
    if (input.type === 'button' || input.type === 'submit' || input.type === 'checkbox' || input.type === 'radio') return false;
    return true;
  }
  // Contenteditable
  if (el.getAttribute('contenteditable') === 'true') return true;
  // Check parent chain for contenteditable
  let p: Element | null = el;
  while (p) {
    if (p.getAttribute('contenteditable') === 'true') return true;
    p = p.parentElement;
  }
  // Text-bearing elements
  if (tag === 'P' || tag === 'SPAN' || tag === 'LI' || tag === 'TD' || tag === 'TH' ||
      tag === 'LABEL' || tag === 'CODE' || tag === 'PRE' || tag === 'BLOCKQUOTE' ||
      tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4' || tag === 'H5' || tag === 'H6') {
    // Only if it has text content and is not inside a link/button
    if (el.textContent && el.textContent.trim().length > 0) {
      let parent = el.parentElement;
      while (parent) {
        const ptag = parent.tagName;
        if (ptag === 'A' || ptag === 'BUTTON') return false;
        parent = parent.parentElement;
      }
      return true;
    }
  }
  return false;
}

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  // Use direct pixel tracking — no spring/delay on main dot
  const dotPosRef = useRef({ x: -100, y: -100 });
  const scaleRef = useRef({ value: 0.5 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const colorRef = useRef<'dark' | 'light'>('dark');
  const debounceRef = useRef<number>(0);
  const isTextRef = useRef(false);
  const morphRef = useRef({ scaleY: 1, width: 20, borderRadius: 50 });

  // Main render loop — dot is always instant (no interpolation)
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      const s = scaleRef.current.value;
      const m = morphRef.current;
      const w = m.width;
      const h = 20 * m.scaleY;
      // Glow follows with slight lag (purely decorative)
      if (glowRef.current) glowRef.current.style.transform = `translate(${x - 25}px, ${y - 25}px)`;
      // Dot/cursor follows INSTANTLY — no lag
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) scale(${s})`;
        dotRef.current.style.width = `${w}px`;
        dotRef.current.style.height = `${h}px`;
        dotRef.current.style.borderRadius = `${m.borderRadius}%`;
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const applyColor = () => {
      if (!dotRef.current) return;
      const light = colorRef.current === 'light'; // true = cursor should be light (on dark bg)
      if (isTextRef.current) {
        // I-beam: contrast with background
        dotRef.current.style.backgroundColor = light ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.85)';
        dotRef.current.style.boxShadow = light
          ? '0 0 4px 1px rgba(255,255,255,0.15)' : '0 0 4px 1px rgba(0,0,0,0.15)';
      } else if (light) {
        // Dark background → white cursor + white glow
        dotRef.current.style.backgroundColor = 'rgba(255,255,255,0.95)';
        dotRef.current.style.boxShadow = '0 0 8px 2px rgba(255,255,255,0.3)';
      } else {
        // Light background → black cursor + soft glow
        dotRef.current.style.backgroundColor = 'rgba(0,0,0,0.8)';
        dotRef.current.style.boxShadow = '0 0 8px 3px rgba(0,0,0,0.15), 0 0 2px 1px rgba(0,0,0,0.1)';
      }
      // Glow halo only on dark bg (white glow looks good), hide on light bg
      if (glowRef.current) glowRef.current.style.opacity = light ? '1' : '0';
    };

    // Morph between dot and I-beam
    const morphToText = () => {
      if (isTextRef.current) return;
      isTextRef.current = true;
      applyColor();
      gsap.to(morphRef.current, {
        width: 2, scaleY: 1.4, borderRadius: 50,
        duration: 0.35, ease: 'elastic.out(1, 0.5)', overwrite: true,
        onUpdate: scheduleUpdate,
      });
    };

    const morphToDot = () => {
      if (!isTextRef.current) return;
      isTextRef.current = false;
      applyColor();
      gsap.to(morphRef.current, {
        width: 20, scaleY: 1, borderRadius: 50,
        duration: 0.4, ease: 'elastic.out(1.2, 0.4)', overwrite: true,
        onUpdate: scheduleUpdate,
      });
    };

    // Initial color
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
          colorRef.current = getVisualBrightness(x, y) > 128 ? 'dark' : 'light';
          applyColor();
        }
      }, 100);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Mouse tracking — dot position is set DIRECTLY, no interpolation
    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      scheduleUpdate();

      // Background color sampling (debounced)
      const now = Date.now();
      if (now - debounceRef.current > 300) {
        debounceRef.current = now;
        if (!isTextRef.current) {
          const lum = getVisualBrightness(e.clientX, e.clientY);
          const shouldBe = lum > 128 ? 'dark' : 'light';
          if (shouldBe !== colorRef.current) {
            colorRef.current = shouldBe;
            applyColor();
          }
        }
      }

      // Text element detection
      const target = e.target as Element;
      const textEl = isTextElement(target) || isTextElement(target.closest('input, textarea, select, [contenteditable]'));
      if (textEl && !isTextRef.current) {
        morphToText();
      } else if (!textEl && isTextRef.current) {
        morphToDot();
      }
    };

    // Click: press to enlarge, release elastic bounce
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
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scheduleUpdate]);

  return (
    <>
      {/* Glow halo — decorative, follows with natural slight lag */}
      <div ref={glowRef} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 50, height: 50,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 200,
        willChange: 'transform', mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
        opacity: 0, transition: 'opacity 0.3s ease', transform: 'translate(-100px, -100px)',
      }} />
      {/* Cursor dot/I-beam — ZERO DELAY, always exactly at mouse position */}
      <div ref={dotRef} aria-hidden className="cursor-dot" style={{
        position: 'fixed', top: 0, left: 0, width: 20, height: 20,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 201,
        willChange: 'transform, width, height, border-radius',
        backgroundColor: 'rgba(0,0,0,0.8)',
        transform: 'translate(-100px, -100px) scale(0.5)', transformOrigin: 'center center',
        boxShadow: '0 0 8px 3px rgba(0,0,0,0.15), 0 0 2px 1px rgba(0,0,0,0.1)',
        transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      }} />
    </>
  );
}
