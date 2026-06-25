'use client';

import { useState, useEffect, useCallback } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0); // 0 → 1

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    setProgress(ratio);
    setShow(scrollTop > window.innerHeight);
  }, []);

  useEffect(() => {
    handleScroll(); // 初始化
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [handleScroll]);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 圆环参数（SVG，viewBox 44x44，半径 20，stroke 2.5）
  const RADIUS = 20;
  const CIRC = 2 * Math.PI * RADIUS; // ≈ 125.66
  const dashOffset = CIRC * (1 - progress);

  return (
    <button
      onClick={handleClick}
      aria-label="Back to top"
      aria-hidden={!show}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: show ? 'auto' : 'none',
      }}
      className="group fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white/[0.72] dark:bg-[#0f0f12]/[0.78] border border-zinc-200/40 dark:border-white/[0.08] text-zinc-600 dark:text-white/70 hover:bg-white/85 dark:hover:bg-[#0f0f12]/[0.9] hover:text-zinc-900 dark:hover:text-white shadow-lg dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center justify-center"
    >
      {/* Progress ring — SVG overlay, rotates as user scrolls */}
      <svg
        className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
        viewBox="0 0 44 44"
        aria-hidden="true"
      >
        {/* Track (subtle) */}
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-zinc-300/30 dark:text-white/[0.08]"
        />
        {/* Progress arc — purple, animates with scroll */}
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          stroke="url(#backToTopGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
        />
        <defs>
          <linearGradient id="backToTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bf5af2" />
            <stop offset="100%" stopColor="#af52de" />
          </linearGradient>
        </defs>
      </svg>

      {/* Arrow icon */}
      <svg
        className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  );
}