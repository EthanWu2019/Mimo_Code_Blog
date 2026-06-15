'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

function SkeletonCard({ delay = 0 }: { delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Shimmer animation
    const shimmer = ref.current.querySelector('.shimmer-bar') as HTMLElement;
    if (shimmer) {
      gsap.fromTo(shimmer,
        { x: '-100%' },
        { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay }
      );
    }
  }, [delay]);

  return (
    <div ref={ref} className="py-7 px-4 -mx-4">
      <div className="flex items-start gap-5">
        {/* Number placeholder */}
        <div className="w-8 h-7 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative flex-shrink-0">
          <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          {/* Tags placeholder */}
          <div className="flex gap-2">
            <div className="w-14 h-4 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
            <div className="w-18 h-4 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
          </div>
          {/* Title placeholder */}
          <div className="h-5 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative" style={{ width: `${70 + Math.random() * 25}%` }}>
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
          </div>
          {/* Excerpt placeholder */}
          <div className="h-4 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative" style={{ width: `${85 + Math.random() * 15}%` }}>
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
          </div>
          {/* Meta placeholder */}
          <div className="flex gap-3">
            <div className="w-16 h-3 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
            <div className="w-10 h-3 rounded bg-zinc-100 dark:bg-white/[0.04] overflow-hidden relative">
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-zinc-200/50 dark:via-white/[0.06] to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlogSkeleton() {
  return (
    <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <SkeletonCard key={i} delay={i * 0.1} />
      ))}
    </div>
  );
}
