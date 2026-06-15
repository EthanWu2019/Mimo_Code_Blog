'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
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

    // Kill any running animations on this element
    gsap.killTweensOf(el);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(el, { display: 'none', clearProps: 'all' });
        isAnimating.current = false;
      },
    });

    tl.set(el, {
      display: 'block',
      opacity: 1,
      clipPath: `circle(0px at ${originX}px ${originY}px)`,
    })
    // Expand circle to cover screen
    .to(el, {
      clipPath: `circle(${maxR}px at ${originX}px ${originY}px)`,
      duration: 0.4,
      ease: 'power2.in',
    })
    // Brief hold
    .to({}, { duration: 0.06 })
    // Fade out to reveal new page
    .to(el, {
      opacity: 0,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, []);

  // Global click interceptor for internal links
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isAnimating.current) return;
      // Only left click, no modifier keys
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

  // Reset on path change
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
    }
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100]"
      style={{ display: 'none', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-zinc-900 dark:bg-white" />
    </div>
  );
}
