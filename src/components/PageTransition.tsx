'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const isAnimating = useRef(false);

  // Global click interceptor
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isAnimating.current) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;

      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/') || href === pathname) return;
      if (href.startsWith('/api/')) return;

      const rect = a.getBoundingClientRect();
      if (rect.width === 0) return;

      originRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [pathname]);

  // Trigger animation when pathname changes
  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    const el = overlayRef.current;
    if (!el) return;

    isAnimating.current = true;
    const { x, y } = originRef.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxR = Math.ceil(Math.sqrt(
      Math.max(x, vw - x) ** 2 + Math.max(y, vh - y) ** 2
    ));

    const startClip = `circle(0px at ${x}px ${y}px)`;
    const endClip = `circle(${maxR}px at ${x}px ${y}px)`;

    // Show overlay at start position
    el.style.display = 'block';
    el.style.opacity = '1';
    el.style.clipPath = startClip;
    (el.style as any).webkitClipPath = startClip;

    // Force layout
    el.getBoundingClientRect();

    // Animate: expand circle (0.4s) then fade out (0.3s)
    el.animate([
      { clipPath: startClip, opacity: 1, offset: 0 },
      { clipPath: endClip, opacity: 1, offset: 0.55 },
      { clipPath: endClip, opacity: 0, offset: 1 },
    ], {
      duration: 700,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards',
    }).onfinish = () => {
      el.style.display = 'none';
      el.style.clipPath = 'none';
      (el.style as any).webkitClipPath = 'none';
      el.style.opacity = '1';
      isAnimating.current = false;
    };
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'none',
        pointerEvents: 'none',
        background: 'var(--background)',
      }}
      aria-hidden="true"
    />
  );
}
