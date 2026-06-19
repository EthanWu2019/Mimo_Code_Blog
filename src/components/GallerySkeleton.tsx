'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function SkeletonCard({ delay = 0, height }: { delay?: number; height: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const shimmer = ref.current.querySelector('.shimmer-bar') as HTMLElement;
    if (shimmer) {
      gsap.fromTo(shimmer,
        { x: '-100%' },
        { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay }
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className="mb-4 break-inside-avoid">
      <div
        className="rounded-xl bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative"
        style={{ height }}
      >
        <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
      </div>
    </div>
  );
}

export default function GallerySkeleton() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const shimmers = heroRef.current.querySelectorAll('.shimmer-bar');
    shimmers.forEach((shimmer, i) => {
      gsap.fromTo(shimmer,
        { x: '-100%' },
        { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay: i * 0.1 }
      );
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div ref={heroRef} className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-3 p-8">
          {['col-span-2 row-span-2', '', '', '', ''].map((span, i) => (
            <div key={i} className={`${span} rounded-xl bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative`}>
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center space-y-4">
          <div className="mx-auto w-48 h-8 rounded-full bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
          </div>
          <div className="mx-auto w-72 h-14 rounded-lg bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
          </div>
          <div className="mx-auto w-96 h-5 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
          </div>
        </div>
      </section>

      {/* Filter bar skeleton */}
      <div className="sticky top-[72px] z-40 backdrop-blur-xl bg-white/[0.02] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {[60, 50, 70, 55, 65].map((w, i) => (
              <div key={i} className="rounded-full bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative" style={{ width: w, height: 28 }}>
                <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="w-12 h-7 rounded-full bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
            <div className="w-18 h-7 rounded-full bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Masonry grid skeleton */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          <SkeletonCard delay={0} height="280px" />
          <SkeletonCard delay={0.1} height="360px" />
          <SkeletonCard delay={0.2} height="240px" />
          <SkeletonCard delay={0.3} height="320px" />
          <SkeletonCard delay={0.4} height="260px" />
          <SkeletonCard delay={0.5} height="380px" />
          <SkeletonCard delay={0.6} height="220px" />
          <SkeletonCard delay={0.7} height="300px" />
        </div>
      </section>
    </div>
  );
}
