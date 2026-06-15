'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const playTransition = useCallback((originX: number, originY: number) => {
    const el = overlayRef.current;
    if (!el || isAnimating.current) return;
    isAnimating.current = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxR = Math.ceil(Math.sqrt(
      Math.max(originX, vw - originX) ** 2 +
      Math.max(originY, vh - originY) ** 2
    ));

    gsap.killTweensOf(el);

    // Set initial state
    gsap.set(el, {
      display: 'block',
      opacity: 1,
      clipPath: `circle(0px at ${originX}px ${originY}px)`,
      WebkitClipPath: `circle(0px at ${originX}px ${originY}px)`,
    });

    // Phase 1: Expand circle
    gsap.to(el, {
      clipPath: `circle(${maxR}px at ${originX}px ${originY}px)`,
      WebkitClipPath: `circle(${maxR}px at ${originX}px ${originY}px)`,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        // Phase 2: Fade out
        gsap.to(el, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out',
          onComplete: () => {
            gsap.set(el, {
              display: 'none',
              clipPath: 'none',
              WebkitClipPath: 'none',
            });
            isAnimating.current = false;
          },
        });
      },
    });
  }, []);

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

      playTransition(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [pathname, playTransition]);

  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
    }
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
      }}
      aria-hidden="true"
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'var(--background)',
      }} />
    </div>
  );
}
