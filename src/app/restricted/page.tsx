'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

interface RestrictedItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  imageUrl: string;
  date: string;
}

// Independent category set — NOT shared with main gallery
const RESTRICTED_CATEGORIES = [
  'Conceptual',
  'Experimental',
  'Abstract Bodies',
  'Surrealism',
  'Dark Art',
];

const RESTRICTED_ITEMS: RestrictedItem[] = [
  { id: 'r1', title: 'Untitled · 1', category: 'Conceptual', tags: ['study', 'monochrome'], imageUrl: 'https://picsum.photos/seed/restricted1/800/1000', date: '2026-05-12' },
  { id: 'r2', title: 'Untitled · 2', category: 'Experimental', tags: ['collage', 'texture'], imageUrl: 'https://picsum.photos/seed/restricted2/600/800', date: '2026-05-08' },
  { id: 'r3', title: 'Untitled · 3', category: 'Abstract Bodies', tags: ['figure', 'form'], imageUrl: 'https://picsum.photos/seed/restricted3/700/900', date: '2026-04-30' },
  { id: 'r4', title: 'Untitled · 4', category: 'Surrealism', tags: ['dream', 'fluid'], imageUrl: 'https://picsum.photos/seed/restricted4/800/1100', date: '2026-04-22' },
  { id: 'r5', title: 'Untitled · 5', category: 'Dark Art', tags: ['shadow', 'symbol'], imageUrl: 'https://picsum.photos/seed/restricted5/600/800', date: '2026-04-15' },
  { id: 'r6', title: 'Untitled · 6', category: 'Conceptual', tags: ['series', 'minimal'], imageUrl: 'https://picsum.photos/seed/restricted6/700/900', date: '2026-04-08' },
  { id: 'r7', title: 'Untitled · 7', category: 'Experimental', tags: ['mixed-media'], imageUrl: 'https://picsum.photos/seed/restricted7/800/1000', date: '2026-03-30' },
  { id: 'r8', title: 'Untitled · 8', category: 'Abstract Bodies', tags: ['anatomy'], imageUrl: 'https://picsum.photos/seed/restricted8/600/800', date: '2026-03-22' },
  { id: 'r9', title: 'Untitled · 9', category: 'Surrealism', tags: ['dream', 'organic'], imageUrl: 'https://picsum.photos/seed/restricted9/700/900', date: '2026-03-15' },
];

export default function RestrictedPage() {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<RestrictedItem | null>(null);

  // Loading delay
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Remember confirmation in session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const wasConfirmed = sessionStorage.getItem('restricted-confirmed') === '1';
      if (wasConfirmed) setConfirmed(true);
    }
  }, []);

  const enterZone = useCallback(() => {
    setConfirmed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('restricted-confirmed', '1');
    }
  }, []);

  const leaveZone = useCallback(() => {
    setConfirmed(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('restricted-confirmed');
    }
    // Navigate back to gallery
    window.location.href = '/gallery';
  }, []);

  // ESC closes lightbox
  useEffect(() => {
    if (!selectedItem) return;
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelectedItem(null); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedItem]);

  if (loading) return <RestrictedSkeleton />;

  const filtered = activeCategory === 'All'
    ? RESTRICTED_ITEMS
    : RESTRICTED_ITEMS.filter(i => i.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      {/* Warning decoration — red glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-red-500/5 dark:bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl" />
      </div>

      {/* Confirmation dialog — appears if NOT confirmed */}
      <AnimatePresence>
        {!confirmed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1a1a1f] border border-zinc-200 dark:border-white/[0.08] p-8 shadow-2xl"
            >
              {/* Warning icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-zinc-900 dark:text-white mb-2">
                Restricted Zone
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-center mb-1 text-sm">
                The following content is not recommended for public viewing.
              </p>
              <p className="text-zinc-400 dark:text-zinc-500 text-center text-xs mb-8">
                View at your own discretion. Please confirm to continue.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={leaveZone}
                  className="flex-1 px-5 py-3 rounded-full bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition-all font-medium border border-zinc-200 dark:border-white/[0.08]"
                >
                  Go Back
                </button>
                <button
                  onClick={enterZone}
                  className="flex-1 px-5 py-3 rounded-full bg-gradient-to-r from-red-500 to-amber-500 text-white font-medium hover:shadow-lg hover:shadow-red-500/20 transition-all"
                >
                  Confirm & Enter
                </button>
              </div>

              <p className="text-zinc-400 dark:text-zinc-600 text-center text-[10px] mt-6">
                This confirmation is recorded in this session only.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content — only visible when confirmed */}
      {confirmed && (
        <>
          {/* Hero */}
          <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6">
            <div className="text-center mb-10 max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs text-red-700 dark:text-red-300 font-medium uppercase tracking-wider">Restricted</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[0.9] mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500 dark:from-red-400 dark:to-amber-300">Restricted</span>
                <span className="text-zinc-400 dark:text-zinc-400"> Works</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-base sm:text-lg max-w-xl mx-auto px-2">
                A separate collection outside the main gallery. Independent categories, independent rules.
              </p>
            </div>

            {/* Category filter — own set, NOT shared with main gallery */}
            <div className="flex justify-center mb-10">
              <div className="glass-nav-acrylic rounded-full px-3 py-2 flex items-center gap-1 max-w-3xl overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setActiveCategory('All')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex-shrink-0 ${
                    activeCategory === 'All'
                      ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                {RESTRICTED_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex-shrink-0 ${
                      activeCategory === cat
                        ? 'bg-red-500/20 text-red-700 dark:text-red-300'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto space-y-4">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="break-inside-avoid group cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] hover:border-red-500/50 dark:hover:border-red-500/30 transition-all bg-white dark:bg-white/[0.02]">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      draggable={false}
                      className="w-full object-cover select-none pointer-events-none"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    {/* Subtle warning tint */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent">
                      <p className="text-zinc-900 dark:text-white font-medium text-sm">{item.title}</p>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                        {item.category} · {item.tags.join(', ')}
                      </p>
                    </div>
                    {/* Restricted tag */}
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-red-500/80 backdrop-blur-sm text-[10px] text-white uppercase tracking-wider">
                      18+
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          <AnimatePresence>
            {selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
              >
                <button
                  onClick={() => setSelectedItem(null)}
                  aria-label="Close"
                  className="absolute top-4 right-4 z-[60] w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="relative max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden"
                >
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    draggable={false}
                    onContextMenu={e => e.preventDefault()}
                    className="max-w-full max-h-[85vh] object-contain select-none"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function RestrictedSkeleton() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const bars = ref.current.querySelectorAll('.shimmer-bar');
    bars.forEach((el, i) => {
      gsap.fromTo(el, { x: '-100%' }, { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay: i * 0.08 });
    });
  }, []);
  return (
    <div ref={ref} className="relative min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] overflow-hidden">
      <div className="relative z-10 pt-24 pb-8 px-4 sm:px-6">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="mx-auto w-44 h-6 rounded-full bg-zinc-200/60 dark:bg-white/[0.04] overflow-hidden relative mb-4">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
          </div>
          <div className="mx-auto w-80 h-16 rounded-lg bg-zinc-200/60 dark:bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
          </div>
        </div>
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="break-inside-avoid rounded-xl bg-zinc-200/40 dark:bg-white/[0.02] overflow-hidden relative" style={{ height: `${200 + (i % 3) * 60}px` }}>
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.04] to-transparent" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
