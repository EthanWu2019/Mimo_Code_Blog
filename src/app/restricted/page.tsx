'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

// A collection = a set of images generated with similar prompts (e.g., same ComfyUI workflow / theme)
// Items inside a collection share metadata; some can override individually

interface Collection {
  id: string;
  title: string;
  category: string;
  tags: string[];
  cover: string;        // cover image URL
  images: string[];     // gallery images in the collection
  prompt: string;       // shared prompt for the collection
  date: string;
  description?: string;
}

interface SingleItem {
  id: string;
  title: string;
  category: string;
  tags: string[];
  imageUrl: string;
  prompt: string;
  date: string;
}

type Entry =
  | { type: 'collection'; data: Collection }
  | { type: 'single'; data: SingleItem };

const CATEGORIES = [
  'Conceptual',
  'Experimental',
  'Abstract Bodies',
  'Surrealism',
  'Dark Art',
];

// Initial demo content (will be filled by uploads)
const V = 1782624222;
const INITIAL_ENTRIES: Entry[] = [];

export default function RestrictedPage() {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [entries, setEntries] = useState<Entry[]>(INITIAL_ENTRIES);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  // Loading delay
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Confirmation state — session only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const c = sessionStorage.getItem('restricted-confirmed') === '1';
      if (c) setConfirmed(true);
    }
  }, []);

  // Fetch entries from API
  useEffect(() => {
    if (!confirmed) return;
    fetch('/api/restricted')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.entries)) setEntries(d.entries);
      })
      .catch(() => {});
  }, [confirmed]);

  const enterZone = useCallback(() => {
    setConfirmed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('restricted-confirmed', '1');
    }
  }, []);

  const leaveZone = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('restricted-confirmed');
    }
    window.location.href = '/gallery';
  }, []);

  // ESC closes
  useEffect(() => {
    if (!selectedEntry) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showPrompt) setShowPrompt(false);
        else setSelectedEntry(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selectedEntry, showPrompt]);

  if (loading) return <RestrictedSkeleton />;

  const filtered = activeCategory === 'All'
    ? entries
    : entries.filter(e => e.data.category === activeCategory);

  return (
    <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#0a0a0b] text-zinc-900 dark:text-white overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-red-500/5 dark:bg-red-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-500/5 dark:bg-amber-500/10 blur-3xl" />
      </div>

      {/* Confirmation dialog */}
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
                  Confirm &amp; Enter
                </button>
              </div>
              <p className="text-zinc-400 dark:text-zinc-600 text-center text-[10px] mt-6">
                This confirmation is recorded in this session only.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      {confirmed && (
        <>
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
                A separate collection outside the main gallery. Each piece shows the prompt used to generate it.
              </p>
            </div>

            {/* Category filter */}
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
                {CATEGORIES.map(cat => (
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
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-400 dark:text-zinc-500 text-sm">
                No entries yet. Upload via /admin or POST /api/restricted.
              </div>
            ) : (
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-6xl mx-auto space-y-4">
                {filtered.map((entry, i) => (
                  <EntryCard
                    key={entry.data.id}
                    entry={entry}
                    index={i}
                    onClick={() => setSelectedEntry(entry)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detail lightbox */}
          <AnimatePresence>
            {selectedEntry && !showPrompt && (
              <motion.div
                key="viewer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl"
                onClick={() => setSelectedEntry(null)}
              >
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                      {selectedEntry.data.category}
                    </span>
                    <h3 className="text-white font-medium text-sm truncate">
                      {selectedEntry.data.title}
                    </h3>
                    {selectedEntry.type === 'collection' && (
                      <span className="text-zinc-400 text-xs">
                        · {selectedEntry.data.images.length} images
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowPrompt(true); }}
                      className="px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      View Prompt
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedEntry(null); }}
                      aria-label="Close"
                      className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Image area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6" onClick={e => e.stopPropagation()}>
                  {selectedEntry.type === 'collection' ? (
                    <CollectionViewer entry={selectedEntry.data} />
                  ) : (
                    <SingleViewer entry={selectedEntry.data} />
                  )}
                </div>
              </motion.div>
            )}

            {/* Prompt viewer */}
            {selectedEntry && showPrompt && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
                onClick={() => setShowPrompt(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={e => e.stopPropagation()}
                  className="relative w-full max-w-2xl max-h-[80vh] rounded-2xl bg-[#0a0a0b] border border-white/[0.08] p-6 overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      <h3 className="text-white font-medium">Generation Prompt</h3>
                    </div>
                    <button
                      onClick={() => setShowPrompt(false)}
                      className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-white transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-4 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                      {selectedEntry.data.prompt || 'No prompt recorded for this entry.'}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                    <span>{selectedEntry.data.date}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedEntry.data.prompt || '');
                      }}
                      className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function EntryCard({ entry, index, onClick }: { entry: Entry; index: number; onClick: () => void }) {
  const cover = entry.type === 'collection' ? entry.data.cover : entry.data.imageUrl;
  const isCollection = entry.type === 'collection';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
      className="break-inside-avoid group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-white/[0.06] hover:border-red-500/50 dark:hover:border-red-500/30 transition-all bg-white dark:bg-white/[0.02]">
        <img
          src={cover}
          alt={entry.data.title}
          loading="lazy"
          draggable={false}
          className="w-full object-cover select-none pointer-events-none"
          onContextMenu={(e) => e.preventDefault()}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white/95 via-white/70 to-transparent dark:from-black/80 dark:via-black/40 dark:to-transparent pointer-events-none">
          <p className="text-zinc-900 dark:text-white font-medium text-sm">{entry.data.title}</p>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs flex items-center gap-1">
            {entry.data.category}
            {isCollection && <>· <span className="text-red-500">图集</span> {entry.data.images.length} images</>}
          </p>
        </div>
        {/* Top badges */}
        <div className="absolute top-2 right-2 flex gap-1 pointer-events-none">
          <span className="px-2 py-0.5 rounded-full bg-red-500/80 backdrop-blur-sm text-[10px] text-white uppercase tracking-wider">
            18+
          </span>
        </div>
        {isCollection && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-500/80 backdrop-blur-sm text-[10px] text-white">
            <svg className="w-2.5 h-2.5 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Collection
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CollectionViewer({ entry }: { entry: Collection }) {
  return (
    <div className="columns-1 sm:columns-2 gap-3 max-w-4xl mx-auto">
      {entry.images.map((img, i) => (
        <div key={i} className="break-inside-avoid mb-3">
          <img
            src={img}
            alt={`${entry.title} #${i + 1}`}
            loading="lazy"
            draggable={false}
            onContextMenu={e => e.preventDefault()}
            className="w-full rounded-lg select-none"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          />
        </div>
      ))}
    </div>
  );
}

function SingleViewer({ entry }: { entry: SingleItem }) {
  // Fit image in viewport — show full content on one screen
  return (
    <div className="flex justify-center items-center w-full h-full min-h-[60vh]">
      <img
        src={entry.imageUrl}
        alt={entry.title}
        draggable={false}
        onContextMenu={e => e.preventDefault()}
        className="max-w-[min(95vw,1400px)] max-h-[calc(100vh-180px)] w-auto h-auto object-contain rounded-lg select-none"
      />
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
