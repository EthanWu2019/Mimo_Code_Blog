'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingPlayer from '@/components/FloatingPlayer';

const categories = ['All', 'Engineering', 'Design', 'Career', 'AI & Tech', 'Open Source'];

interface Episode {
  id: number;
  number: number;
  title: string;
  description: string;
  duration: string;
  date: string;
  category: string;
  thumbnail: string;
  featured: boolean;
}

const episodes: Episode[] = [
  {
    id: 1,
    number: 1,
    title: 'Building Scalable Systems at Scale',
    description: 'We dive deep into the architecture behind systems that serve millions of users. From distributed databases to microservices patterns that actually work in production.',
    duration: '48 min',
    date: 'Jun 10, 2026',
    category: 'Engineering',
    thumbnail: 'from-violet-600 to-indigo-700',
    featured: true,
  },
  {
    id: 2,
    number: 2,
    title: 'The Future of AI in Software Engineering',
    description: 'How AI is reshaping the way we write, review, and ship code. We explore the tools, the hype, and the reality of AI-assisted development.',
    duration: '52 min',
    date: 'Jun 3, 2026',
    category: 'AI & Tech',
    thumbnail: 'from-cyan-500 to-blue-600',
    featured: true,
  },
  {
    id: 3,
    number: 3,
    title: 'Design Systems That Actually Work',
    description: 'What separates a design system that gets adopted from one that gathers dust? We talk tokens, components, and the culture shift required.',
    duration: '42 min',
    date: 'May 27, 2026',
    category: 'Design',
    thumbnail: 'from-pink-500 to-rose-600',
    featured: true,
  },
  {
    id: 4,
    number: 4,
    title: 'From Junior to Senior: Career Lessons',
    description: 'Honest stories about the non-linear path from junior engineer to staff and beyond. The mistakes, the breakthroughs, and the advice nobody gave us.',
    duration: '56 min',
    date: 'May 20, 2026',
    category: 'Career',
    thumbnail: 'from-amber-500 to-orange-600',
    featured: false,
  },
  {
    id: 5,
    number: 5,
    title: 'Open Source Sustainability',
    description: 'The maintainers keeping the internet running are burning out. We explore funding models, governance, and what the ecosystem really needs.',
    duration: '39 min',
    date: 'May 13, 2026',
    category: 'Open Source',
    thumbnail: 'from-emerald-500 to-teal-600',
    featured: false,
  },
  {
    id: 6,
    number: 6,
    title: 'The Art of Code Review',
    description: 'Code review is where software quality lives or dies. We discuss practices that make reviews effective without making them soul-crushing.',
    duration: '35 min',
    date: 'May 6, 2026',
    category: 'Engineering',
    thumbnail: 'from-blue-500 to-indigo-600',
    featured: false,
  },
  {
    id: 7,
    number: 7,
    title: 'Web Performance in 2026',
    description: 'Core Web Vitals, edge computing, streaming SSR, and the new rendering patterns. What actually moves the needle for users this year.',
    duration: '44 min',
    date: 'Apr 29, 2026',
    category: 'Engineering',
    thumbnail: 'from-fuchsia-500 to-purple-600',
    featured: false,
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const heroFadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function PodcastPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [playingId, setPlayingId] = useState<number | null>(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const featuredEpisodes = episodes.filter((e) => e.featured);
  const nonFeatured = episodes.filter((e) => !e.featured);
  const filtered =
    activeCategory === 'All'
      ? nonFeatured
      : nonFeatured.filter((e) => e.category === activeCategory);

  const playingEpisode = episodes.find((e) => e.id === playingId);

  return (
    <main className="min-h-screen">
      {/* ───────── Hero Section (80vh) ───────── */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical lines */}
          <div className="absolute top-16 left-[12%] w-px h-32 bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute top-24 right-[18%] w-px h-20 bg-gradient-to-b from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute bottom-28 left-[22%] w-px h-16 bg-gradient-to-b from-transparent via-violet-300/30 dark:via-violet-700/30 to-transparent" />
          {/* Horizontal lines */}
          <div className="absolute bottom-24 left-[18%] w-20 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          <div className="absolute top-1/3 right-[14%] w-16 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent" />
          {/* Dots */}
          <div className="absolute top-1/4 left-[10%] w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="absolute bottom-1/3 right-[11%] w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          <div className="absolute top-[60%] left-[35%] w-1 h-1 rounded-full bg-violet-300/40 dark:bg-violet-700/40" />
          {/* Gradient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/[0.04] dark:bg-violet-500/[0.06] blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-6 w-full relative z-10 text-center">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium">
              Conversations &amp; Insights
            </span>
            <div className="w-8 h-[1px] bg-zinc-300 dark:bg-zinc-700" />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-6xl md:text-7xl lg:text-[96px] font-bold tracking-tighter text-zinc-900 dark:text-white leading-[0.9] mb-6"
          >
            Podcast
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="text-base md:text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed"
          >
            Conversations on engineering, design, and building products.
          </motion.p>

          {/* Decorative geometric element — concentric circles (different from blog's diamond) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="mt-10 flex justify-center"
          >
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border border-zinc-200 dark:border-zinc-800" />
              <div className="absolute inset-2 rounded-full border border-zinc-200 dark:border-zinc-800" />
              <div className="absolute inset-[18px] rounded-full bg-violet-500/20 dark:bg-violet-500/30" />
            </div>
          </motion.div>

          {/* Recent Picks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 font-medium mb-6">
              Recent Picks
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {featuredEpisodes.slice(0, 3).map((ep, i) => (
                <motion.div
                  key={ep.id}
                  custom={0.6 + i * 0.12}
                  variants={heroFadeUp}
                  initial="hidden"
                  animate="show"
                  className="group relative rounded-xl bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] p-5 text-left hover:bg-white/[0.08] dark:hover:bg-white/[0.06] transition-all duration-300 hover:scale-[1.03] cursor-pointer"
                  onClick={() => { setPlayingId(ep.id); setIsPlaying(true); }}
                >
                  {/* Gradient accent top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${ep.thumbnail}`} />

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                      EP {ep.number}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {ep.duration}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2 line-clamp-2 leading-snug">
                    {ep.title}
                  </h3>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                      {ep.category}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlayingId(ep.id); setIsPlaying(true); }}
                      className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-white hover:bg-violet-500 transition-colors hover:scale-110"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="ml-0.5">
                        <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ───────── Category Filter Bar ───────── */}
      <section className="sticky top-16 z-30 px-6 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                    : 'bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] text-zinc-700 dark:text-white/70 hover:bg-white/[0.1] dark:hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Episode Grid ───────── */}
      <section className="px-6 py-16 pb-32">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filtered.map((ep) => (
                <motion.article
                  key={ep.id}
                  variants={fadeUp}
                  layout
                  className="group rounded-xl bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden hover:scale-[1.02] hover:bg-white/[0.08] dark:hover:bg-white/[0.06] transition-all duration-300 cursor-pointer"
                  onClick={() => { setPlayingId(ep.id); setIsPlaying(true); }}
                >
                  {/* Thumbnail */}
                  <div className={`relative aspect-video bg-gradient-to-br ${ep.thumbnail} flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlayingId(ep.id); setIsPlaying(true); }}
                      className="relative z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-violet-600/80"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white ml-0.5">
                        <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                      </svg>
                    </button>
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 text-[11px] font-mono font-medium rounded-full bg-black/40 backdrop-blur-sm text-white">
                      EP {ep.number}
                    </span>
                    <span className="absolute top-3 right-3 px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-black/40 backdrop-blur-sm text-white">
                      {ep.duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                        {ep.category}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-white/40">{ep.date}</span>
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-white mb-1.5 line-clamp-1">
                      {ep.title}
                    </h3>
                    <p className="text-sm text-zinc-600 dark:text-white/50 line-clamp-2 leading-relaxed">
                      {ep.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-zinc-500 dark:text-white/40 py-16"
            >
              No episodes in this category yet.
            </motion.p>
          )}
        </div>
      </section>

      {/* ───────── Floating Player ───────── */}
      {playingEpisode && (
        <FloatingPlayer
          episode={playingEpisode}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
        />
      )}
    </main>
  );
}
