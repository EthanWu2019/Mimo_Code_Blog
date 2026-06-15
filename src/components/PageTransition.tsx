'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PageTransition() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const router = useRouter();

  // Global click interceptor — PREVENTS navigation, plays animation first
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

      // Prevent default navigation
      e.preventDefault();
      e.stopPropagation();

      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const el = overlayRef.current;
      if (!el) {
        router.push(href);
        return;
      }

      isAnimating.current = true;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxR = Math.ceil(Math.sqrt(
        Math.max(x, vw - x) ** 2 + Math.max(y, vh - y) ** 2
      ));

      const startClip = `circle(0px at ${x}px ${y}px)`;
      const endClip = `circle(${maxR}px at ${x}px ${y}px)`;

      // Set initial state
      el.style.display = 'block';
      el.style.opacity = '1';
      el.style.clipPath = startClip;
      (el.style as any).webkitClipPath = startClip;

      // Force layout
      el.getBoundingClientRect();

      // Play animation: expand (0.4s) → hold (0.05s) → fade (0.25s)
      const anim = el.animate([
        { clipPath: startClip, opacity: 1, offset: 0 },
        { clipPath: endClip, opacity: 1, offset: 0.6 },
        { clipPath: endClip, opacity: 0, offset: 1 },
      ], {
        duration: 700,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      });

      // Navigate when circle fully expanded (before fade-out)
      setTimeout(() => {
        router.push(href);
      }, 400);

      // Cleanup when animation finishes
      anim.onfinish = () => {
        el.style.display = 'none';
        el.style.clipPath = 'none';
        (el.style as any).webkitClipPath = 'none';
        el.style.opacity = '1';
        isAnimating.current = false;
      };

      // Safety timeout
      setTimeout(() => {
        if (isAnimating.current) {
          el.style.display = 'none';
          isAnimating.current = false;
        }
      }, 1200);
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [pathname, router]);

  // Reset on path change
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
        background: 'var(--background)',
      }}
      aria-hidden="true"
    />
  );
}
