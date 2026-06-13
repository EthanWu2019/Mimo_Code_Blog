'use client';

import { useState, useEffect, useCallback } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  const handleScroll = useCallback(() => {
    setShow(window.scrollY > window.innerHeight);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-white/50 dark:bg-white/[0.08] backdrop-blur-2xl border border-zinc-200/40 dark:border-white/[0.08] text-zinc-600 dark:text-white/60 hover:bg-white/70 dark:hover:bg-white/[0.12] hover:text-zinc-900 dark:hover:text-white/80 transition-all duration-300 shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center"
      aria-label="Back to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}
