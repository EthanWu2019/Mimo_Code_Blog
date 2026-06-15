'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function PageTransition() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  const playTransition = useCallback((originX: number, originY: number) => {
    const overlay = overlayRef.current;
    const reveal = revealRef.current;
    if (!overlay || !reveal || isAnimating.current) return;

    isAnimating.current = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Radius needed to cover entire viewport from origin
    const maxR = Math.ceil(Math.sqrt(
      Math.max(originX, vw - originX) ** 2 +
      Math.max(originY, vh - originY) ** 2
    ));

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { display: 'none' });
        gsap.set(reveal, { display: 'none' });
        isAnimating.current = false;
      },
    });

    // Phase 1: Dark circle expands from click point to cover screen
    tl.set(overlay, { display: 'block', opacity: 1 })
      .fromTo(overlay,
        { clipPath: `circle(0px at ${originX}px ${originY}px)` },
        {
          clipPath: `circle(${maxR}px at ${originX}px ${originY}px)`,
          duration: 0.45,
          ease: 'power3.in',
        }
      )
      // Phase 2: Hold briefly while page content swaps underneath
      .to({}, { duration: 0.08 })
      // Phase 3: Overlay fades out to reveal new page
      .to(overlay, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
  }, []);

  // Listen for clicks on internal links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (isAnimating.current) return;
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || !href.startsWith('/') || href === pathname) return;

      // Check if it's within the same origin
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;

      const rect = target.getBoundingClientRect();
      playTransition(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, playTransition]);

  // Safety timeout: if animation finishes before path changes, force complete
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      // Path changed — if overlay is still visible, let the fade-out play
      const overlay = overlayRef.current;
      if (overlay && isAnimating.current) {
        // The timeline is already running, it will fade out on its own
      }
    }
  }, [pathname]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      style={{ display: 'none' }}
    >
      <div className="absolute inset-0 bg-zinc-900 dark:bg-white" />
    </div>
  );
}
