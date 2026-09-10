'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { useTheme } from './ThemeProvider';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar({ initialSession }: { initialSession: Session | null } = { initialSession: null }) {
  // Pass the server-resolved session as `initialData` so the first
  // render after hydration reflects the actual signed-in state
  // instead of a perpetual loading skeleton. Without this, every
  // server-rendered page shows an empty auth-cta slot until the
  // client-side useSession fetch completes (~100 ms in practice
  // but the brief flash is noticeable on slow networks).
  const { data: liveSession, status } = useSession({ required: false });
  const session = liveSession ?? initialSession;
  // `status` is 'loading' until useSession resolves; the prop is
  // the pre-hydrated value so we can render the right markup immediately.
  // Treat a server-resolved session as authenticated immediately; only
  // fall back to useSession's status when we have no session data at
  // all. This avoids a perpetual loading skeleton on first paint
  // for users with a valid cookie.
  const effectiveStatus = session
    ? 'authenticated'
    : status === 'unauthenticated'
      ? 'unauthenticated'
      : status;
  const { theme, toggleTheme } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  // First-render session: prefer server-injected data, then the
  // useSession payload, then null. This way the loading skeleton
  // is rendered only for the very brief moment useSession needs to
  // validate the session client-side.
  const initialSessionData = session ?? initialSession;
  const [isCompact, setIsCompact] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isBlog = pathname === '/blog';
  const isPost = pathname.startsWith('/posts/');
  const isGallery = pathname === '/gallery';
  const isPhotography = pathname === '/photography';
  const isProject = pathname === '/project';

  // close mobile menu on route change so it doesn't stay open
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // close mobile menu on route change so it doesn't stay open
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (session?.user) fetch('/api/user/profile').then(r => r.json()).then(d => setAvatar(d.image)).catch(() => {});
  }, [session]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (isPost) setIsCompact(y > 30);
      else if (isBlog || isGallery || isPhotography) setIsCompact(y > window.innerHeight * 0.8);
      else setIsCompact(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isPost, isBlog, isGallery, isPhotography]);

  // close mobile menu when window grows past sm breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // close mobile menu when window grows past sm breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 640) setIsMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const userImage = avatar || (session?.user as any)?.image;

  const getMaxWidth = () => {
    if (isPost) return isCompact ? '64rem' : '80rem';
    if (isBlog) return isCompact ? '52rem' : '80rem';
    return '80rem';
  };

  return (
    <>
      <div className="h-[72px]" />
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3">
        <div
          className="glass-nav-acrylic rounded-full px-6 h-14 flex items-center justify-between w-full"
          style={{
            maxWidth: getMaxWidth(),
            transition: 'max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Link href="/" className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
            Ethan Wu
          </Link>
          <div className="flex items-center gap-1">
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/project" className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
                Project
              </Link>
              <Link href="/blog" className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
                Blog
              </Link>
              <Link href="/photography" className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
                Photography
              </Link>
              <Link href="/gallery" className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
                AI Gallery
              </Link>

              <button
                data-theme-toggle
                onClick={() => toggleTheme()}
                className="ml-1 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300"
                aria-label="Toggle theme"
              >
                <div className="relative w-5 h-5 overflow-hidden">
                  <svg
                    className={`absolute inset-0 w-5 h-5 text-amber-500 transition-all duration-300 ease-out ${
                      theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707M12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <svg
                    className={`absolute inset-0 w-5 h-5 text-zinc-400 transition-all duration-300 ease-out ${
                      theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354a9 9 0 018.646 3.646 9.003 9.003 0 0012-21 9.003 9.003 0 00-8.354-5.646z" />
                  </svg>
                </div>
              </button>
            </nav>

            {effectiveStatus === 'loading' ? (
              <div className="w-9 h-9 ml-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            ) : session?.user ? (
              <Link href="/profile" className="flex items-center gap-2 ml-1 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                {userImage ? (
                  <img src={userImage} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                    {session.user.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                <Link href="/login" className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
                  Login
                </Link>
                <Link href="/register" className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all">
                  Register
                </Link>
              </div>
            )}

            {/* Hamburger toggle — only on small viewports. */}
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="sm:hidden ml-1 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu panel — full-width dropdown under the navbar. */}
          {isMobileMenuOpen && (
            <div className="sm:hidden fixed left-4 right-4 top-[68px] z-40 rounded-2xl border border-zinc-200/60 dark:border-white/[0.08] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl shadow-zinc-900/10 dark:shadow-black/40 px-3 py-2">
              <nav className="flex flex-col gap-0.5">
                <Link href="/project" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg">Project</Link>
                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg">Blog</Link>
                <Link href="/photography" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg">Photography</Link>
                <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg">AI Gallery</Link>
                <div className="my-1 h-px bg-zinc-200/60 dark:bg-white/[0.08]" />
                <button
                  type="button"
                  onClick={() => { setIsMobileMenuOpen(false); toggleTheme(); }}
                  className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg w-full text-left flex items-center gap-2"
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 dark:bg-zinc-400" />
                  Toggle theme
                </button>
                {!session?.user && (
                  <>
                    <div className="my-1 h-px bg-zinc-200/60 dark:bg-white/[0.08]" />
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg">Login</Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-900 dark:text-white bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg text-center">Register</Link>
                  </>
                )}
                {session?.user && (
                  <>
                    <div className="my-1 h-px bg-zinc-200/60 dark:bg-white/[0.08]" />
                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="px-3 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.06] rounded-lg">Profile</Link>
                  </>
                )}
              </nav>
            </div>
          )}

        </div>
      </header>
    </>
  );
}
