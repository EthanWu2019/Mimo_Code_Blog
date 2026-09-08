'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from './ThemeProvider';
import Navbar from './Navbar';

// Map URL pathname -> the right-side label shown in the page-transition
// overlay. Used both as the default for the initial render of the overlay
// (fixing "the loading page on /login or /register shows empty") and inside
// the click handler below.
//
// Falls through to `""` for unknown routes so the right side quietly hides
// instead of showing a stale/incorrect name.
function pageNameFor(path: string): string {
  if (path === '/') return 'Home';
  if (path === '/blog' || path.startsWith('/posts/')) return 'Blog';
  if (path === '/gallery' || path.startsWith('/gallery/')) return 'AI Gallery';
  if (path === '/photography') return 'Photography';
  if (path === '/project' || path.startsWith('/project/')) return 'Project';
  if (path === '/profile' || path.startsWith('/profile/')) return 'Profile';
  if (path === '/login') return 'Login';
  if (path === '/register') return 'Register';
  if (path === '/admin' || path.startsWith('/admin/')) return 'Admin';
  if (path === '/restricted') return 'Restricted';
  if (path === '/four-oh-four') return '404';
  // Pages that exist but are intentionally hidden from the navbar
  // (Podcast, Sleep) — still reachable by direct URL.
  if (path === '/podcast') return 'Podcast';
  if (path === '/sleep') return 'Sleep';
  // Resume: view + edit both show "Resume" on the right side of the
  // overlay so the user knows where they are going. The page itself
  // differentiates view vs edit visually.
  if (path === '/resume' || path.startsWith('/resume/')) return 'Resume';
  return '';
}

function TransitionOverlay({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const isAnimating = useRef(false);
  const pendingHref = useRef<string | null>(null);
  const pendingPageName = useRef<string>(pageNameFor(pathname));
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
      // Determine overlay right-side text based on destination
      pendingPageName.current = pageNameFor(href);

      const ov = overlayRef.current;
      const ct = contentRef.current;
      if (!ov) { router.push(href); return; }

      // Show overlay with fade-in
      ov.style.display = 'flex';
      ov.style.opacity = '0';
      if (ct) ct.style.opacity = '0';
      if (textRef.current) textRef.current.textContent = pendingPageName.current;


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
          <div className="flex items-center">
            <span className="text-xl font-medium tracking-tight select-none text-right" style={{ color: 'var(--foreground)', minWidth: '140px' }}>
              Ethan Wu
            </span>
            <span className="text-xl font-light mx-4 select-none" style={{ color: 'var(--foreground)', opacity: 0.4 }}>|</span>
            <span ref={textRef} className="text-xl font-medium tracking-tight select-none text-left" style={{ color: 'var(--foreground)', minWidth: '140px' }}>
              {pendingPageName.current || 'Loading'}
            </span>
          </div>
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
