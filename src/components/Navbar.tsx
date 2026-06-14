'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from './ThemeProvider';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(false);
  const pathname = usePathname();
  const isPostPage = pathname.startsWith('/posts/');

  useEffect(() => {
    if (session?.user) fetch('/api/user/profile').then(r => r.json()).then(d => setAvatar(d.avatar)).catch(() => {});
  }, [session]);

  useEffect(() => {
    const handleScroll = () => {
      if (isPostPage) {
        // 文章详情页：滚动 50px 就缩短
        setIsCompact(window.scrollY > 50);
      } else {
        // 主页：滚动过整个英雄界面 (100vh) 才缩短
        setIsCompact(window.scrollY > window.innerHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userImage = avatar || (session?.user as any)?.image;

  return (
    <header 
      className="sticky top-0 z-50 flex justify-center px-4 pt-3"
      style={{
        transition: 'padding 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div 
        className="glass-nav-acrylic rounded-full px-6 h-14 flex items-center justify-between w-full"
        style={{
          maxWidth: isPostPage 
            ? (isCompact ? '72rem' : '80rem')  // 文章页面
            : (isCompact ? '56rem' : '80rem'),  // 其他页面
          transition: 'max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Link href="/" className="text-base font-semibold tracking-tight text-zinc-900 dark:text-white">
          Ethan&apos;s Blog
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/" className="px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg transition-colors">
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
  );
}
