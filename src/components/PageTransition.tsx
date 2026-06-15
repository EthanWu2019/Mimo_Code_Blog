'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    if (isAnimating.current) return;

    const overlay = overlayRef.current;
    if (!overlay) return;

    isAnimating.current = true;
    prevPath.current = pathname;

    // Transition: overlay slides in from left, then slides out to right
    const tl = gsap.timeline({
      onComplete: () => { isAnimating.current = false; },
    });

    tl.set(overlay, { x: '-100%', opacity: 1, display: 'block' })
      .to(overlay, {
        x: '0%',
        duration: 0.25,
        ease: 'power2.in',
      })
      .to(overlay, {
        x: '100%',
        duration: 0.25,
        ease: 'power2.out',
        delay: 0.05,
      })
      .set(overlay, { display: 'none', x: '-100%' });
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ display: 'none' }}
    >
      {/* Gradient overlay with glass effect */}
      <div className="absolute inset-0 bg-zinc-900/95 dark:bg-white/95 backdrop-blur-sm" />
      {/* Subtle decorative line */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 dark:via-black/20 to-transparent" />
    </div>
  );
}
