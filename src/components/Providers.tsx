'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import Navbar from './Navbar';

function TransitionOverlay({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);
  const pendingHref = useRef<string | null>(null);
  const pendingPageName = useRef<string>("Ethan's Blog");
  const prevPath = useRef(pathname);

  // Handle route change after animation
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      const ov = overlayRef.current;
      const ct = contentRef.current;
      if (!ov || !isAnimating.current) return;

      // First hide logo, THEN fade out overlay
      const hideLogo = ct ? ct.animate([
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-6px)' },
      ], { duration: 180, easing: 'ease-in', fill: 'forwards' }).finished : Promise.resolve();

      hideLogo.then(() => {
        const anim = ov.animate([
          { opacity: 1 },
          { opacity: 0 },
        ], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
        anim.onfinish = () => {
          ov.style.display = 'none';
          ov.style.opacity = '1';
          if (ct) ct.style.opacity = '0';
          isAnimating.current = false;
        };
      });
    }
  }, [pathname]);

  // Click interceptor
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (isAnimating.current) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/') || href === pathname || href.startsWith('/api/')) return;

      const rect = a.getBoundingClientRect();
      if (rect.width === 0) return;

      e.preventDefault();
      isAnimating.current = true;
      pendingHref.current = href;
      // Determine overlay text based on destination
      if (href === '/') pendingPageName.current = "Ethan's Blog";
      else if (href === '/blog') pendingPageName.current = 'Blog';
      else if (href === '/podcast') pendingPageName.current = 'Podcast';
      else if (href === '/profile') pendingPageName.current = 'Profile';
      else if (href.startsWith('/posts/')) pendingPageName.current = 'Article';
      else pendingPageName.current = "Ethan's Blog";

      const ov = overlayRef.current;
      const ct = contentRef.current;
      if (!ov) { router.push(href); return; }

      // Show overlay with fade-in
      ov.style.display = 'flex';
      ov.style.opacity = '0';
      if (ct) ct.style.opacity = '0';

      const anim = ov.animate([
        { opacity: 0 },
        { opacity: 1 },
      ], { duration: 300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });

      anim.onfinish = () => {
        // Logo appears
        if (ct) {
          ct.animate([
            { opacity: 0, transform: 'translateY(8px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 250, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
        }
        // Navigate after brief hold
        setTimeout(() => {
          if (pendingHref.current) {
            router.push(pendingHref.current);
            pendingHref.current = null;
          }
        }, 200);
      };
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [pathname, router]);

  return (
    <>
      {children}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] items-center justify-center pointer-events-none"
        style={{ display: 'none', background: 'var(--background)' }}
      >
        <div ref={contentRef} className="flex flex-col items-center" style={{ opacity: 0 }}>
          <span className="text-xl font-medium tracking-tight select-none" style={{ color: 'var(--foreground)' }}>
            {pendingPageName.current}
          </span>
          <div className="mt-3 h-px w-10" style={{ background: 'var(--foreground)', opacity: 0.2 }} />
        </div>
      </div>
    </>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <TransitionOverlay>
          <Navbar />
          <main>{children}</main>
        </TransitionOverlay>
      </ThemeProvider>
    </SessionProvider>
  );
}
