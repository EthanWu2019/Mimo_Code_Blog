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
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const input = el as HTMLInputElement;
    if (input.type === 'button' || input.type === 'submit' || input.type === 'checkbox' || input.type === 'radio') return false;
    return true;
  }
  if (el.getAttribute('contenteditable') === 'true') return true;
  let p: Element | null = el;
  while (p) {
    if (p.getAttribute('contenteditable') === 'true') return true;
    p = p.parentElement;
  }
  if (tag === 'P' || tag === 'SPAN' || tag === 'LI' || tag === 'TD' || tag === 'TH' ||
      tag === 'LABEL' || tag === 'CODE' || tag === 'PRE' || tag === 'BLOCKQUOTE' ||
      tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4' || tag === 'H5' || tag === 'H6') {
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

const DOT_SIZE = 22;
const IBEAM_W = 8;
const IBEAM_H = 38;

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const isDownRef = useRef(false);
  const colorRef = useRef<'dark' | 'light'>('dark');
  const debounceRef = useRef<number>(0);
  const isTextRef = useRef(false);

  // Current shape — directly written to DOM, no GSAP
  const wRef = useRef(DOT_SIZE);
  const hRef = useRef(DOT_SIZE);
  // Click press scale
  const pressRef = useRef(1);

  const renderCursor = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      const { x, y } = posRef.current;
      const w = wRef.current;
      const h = hRef.current;
      const p = pressRef.current;
      const vw = w * p;
      const vh = h * p;
      if (glowRef.current) glowRef.current.style.transform = `translate(${x - 32}px, ${y - 32}px)`;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x - vw / 2}px, ${y - vh / 2}px)`;
        dotRef.current.style.width = `${vw}px`;
        dotRef.current.style.height = `${vh}px`;
      }
      rafRef.current = 0;
    });
  }, []);

  useEffect(() => {
    const applyColor = () => {
      if (!dotRef.current) return;
      const light = colorRef.current === 'light';
      if (isTextRef.current) {
        dotRef.current.style.backgroundColor = light ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)';
        dotRef.current.style.boxShadow = light
          ? '0 0 4px 1px rgba(0,0,0,0.15)' : '0 0 4px 1px rgba(255,255,255,0.15)';
      } else if (light) {
        dotRef.current.style.backgroundColor = 'rgba(255,255,255,0.95)';
        dotRef.current.style.boxShadow = '0 0 8px 2px rgba(255,255,255,0.3)';
      } else {
        dotRef.current.style.backgroundColor = 'rgba(0,0,0,0.8)';
        dotRef.current.style.boxShadow = '0 0 8px 3px rgba(0,0,0,0.15), 0 0 2px 1px rgba(0,0,0,0.1)';
      }
      if (glowRef.current) glowRef.current.style.opacity = light ? '1' : '0';
    };

    // Animate w and h via GSAP — these are plain numbers on a plain object
    const shape = { w: DOT_SIZE, h: DOT_SIZE };

    const morphToText = () => {
      if (isTextRef.current) return;
      isTextRef.current = true;
      applyColor();
      gsap.to(shape, {
        w: IBEAM_W, h: IBEAM_H,
        duration: 0.25,
        ease: 'back.out(2)',
        overwrite: true,
        onUpdate() {
          wRef.current = shape.w;
          hRef.current = shape.h;
          renderCursor();
        },
      });
    };

    const morphToDot = () => {
      if (!isTextRef.current) return;
      isTextRef.current = false;
      applyColor();
      gsap.to(shape, {
        w: DOT_SIZE, h: DOT_SIZE,
        duration: 0.2,
        ease: 'back.out(2)',
        overwrite: true,
        onUpdate() {
          wRef.current = shape.w;
          hRef.current = shape.h;
          renderCursor();
        },
      });
    };

    colorRef.current = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    applyColor();
    renderCursor();

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

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      renderCursor();
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
      const target = e.target as Element;
      const textEl = isTextElement(target) || isTextElement(target.closest('input, textarea, select, [contenteditable]'));
      if (textEl && !isTextRef.current) morphToText();
      else if (!textEl && isTextRef.current) morphToDot();
    };

    const handleDown = () => {
      isDownRef.current = true;
      pressRef.current = 1.4;
      renderCursor();
    };
    const handleUp = () => {
      if (!isDownRef.current) return;
      isDownRef.current = false;
      gsap.to(pressRef, {
        current: 1,
        duration: 0.6,
        ease: 'elastic.out(1.2, 0.3)',
        overwrite: true,
        onUpdate: renderCursor,
      });
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
  }, [renderCursor]);

  return (
    <>
      <div ref={glowRef} aria-hidden style={{
        position: 'fixed', top: 0, left: 0, width: 64, height: 64,
        borderRadius: '50%', pointerEvents: 'none', zIndex: 200,
        willChange: 'transform', mixBlendMode: 'screen',
        background: 'radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%)',
        opacity: 0, transition: 'opacity 0.3s ease', transform: 'translate(-100px, -100px)',
      }} />
      <div ref={dotRef} aria-hidden className="cursor-dot" style={{
        position: 'fixed', top: 0, left: 0,
        width: DOT_SIZE, height: DOT_SIZE,
        borderRadius: '50%',
        pointerEvents: 'none', zIndex: 201,
        willChange: 'transform, width, height',
        backgroundColor: 'rgba(0,0,0,0.8)',
        transform: 'translate(-100px, -100px)',
        boxShadow: '0 0 8px 3px rgba(0,0,0,0.15), 0 0 2px 1px rgba(0,0,0,0.1)',
      }} />
    </>
  );
}
