'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const pathname = usePathname();
  const isBlog = pathname === '/blog';
  const isPost = pathname.startsWith('/posts/');

  const headerRef = useRef<HTMLElement>(null);
  const bounceRef = useRef<gsap.core.Tween | null>(null);
  const pullActive = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (session?.user) fetch('/api/user/profile').then(r => r.json()).then(d => setAvatar(d.avatar)).catch(() => {});
  }, [session]);

  // Compact mode via scroll
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (isPost) setIsCompact(y > 30);
      else if (isBlog) setIsCompact(y > window.innerHeight * 0.85);
      else setIsCompact(false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isPost, isBlog]);

  // Pull-down elastic: uses wheel event (works with trackpad overscroll)
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Scrolling UP while at the very top = trackpad overscroll
      if (window.scrollY <= 0 && e.deltaY < 0) {
        if (settleTimer.current) { clearTimeout(settleTimer.current); settleTimer.current = null; }

        if (!pullActive.current) {
          pullActive.current = true;
          if (bounceRef.current) bounceRef.current.kill();
          gsap.set(el, { y: 16, scale: 1.035 });
        }
      }
      // Scrolling DOWN while pulled = release, bounce back
      else if (pullActive.current && e.deltaY > 0) {
        doBounceBack(el);
      }
    };

    const onScroll = () => {
      // scrollY became positive while pulled = also release
      if (pullActive.current && window.scrollY > 0) {
        doBounceBack(el);
      }
      // At top, not pulled, not bouncing: schedule settle in case overscroll ends silently
      if (window.scrollY <= 0 && !pullActive.current) {
        if (settleTimer.current) clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(() => {
          if (pullActive.current) doBounceBack(el);
        }, 400);
      }
    };

    const doBounceBack = (target: HTMLElement) => {
      if (!pullActive.current) return;
      pullActive.current = false;
      if (settleTimer.current) { clearTimeout(settleTimer.current); settleTimer.current = null; }
      if (bounceRef.current) bounceRef.current.kill();
      bounceRef.current = gsap.to(target, {
        y: 0,
        scale: 1,
        duration: 0.9,
        ease: 'elastic.out(1.2, 0.3)',
      });
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
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
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3"
        style={{ transformOrigin: 'center top' }}
      >
        <div
          className="glass-nav-acrylic rounded-full px-6 h-14 flex items-center justify-between w-full"
          style={{
            maxWidth: getMaxWidth(),
            transition: 'max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Link href="/" className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
            Ethan&apos;s Blog
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/blog" className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
              Blog
            </Link>

            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                toggleTheme(rect.left + rect.width / 2, rect.top + rect.height / 2);
              }}
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
            </button>

            {status === 'loading' ? (
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
              <div className="flex items-center gap-1.5 ml-1">
                <Link href="/login" className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all">
                  Sign up
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
