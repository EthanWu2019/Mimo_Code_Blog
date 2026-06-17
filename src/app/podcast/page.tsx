'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
    featured: false,
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
    featured: false,
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

export default function PodcastPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [playingId, setPlayingId] = useState<number | null>(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const featured = episodes.find((e) => e.featured)!;
  const filtered = episodes
    .filter((e) => !e.featured)
    .filter((e) => activeCategory === 'All' || e.category === activeCategory);

  const playingEpisode = episodes.find((e) => e.id === playingId);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white ml-1">
              <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight font-[family-name:var(--font-geist-sans)]"
          >
            Podcast
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 text-lg text-zinc-600 dark:text-white/60 max-w-xl mx-auto"
          >
            Conversations on engineering, design, and building products.
          </motion.p>
        </div>
      </section>

      {/* Featured Episode */}
      <section className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="rounded-2xl bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden"
          >
            {/* Video placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-indigo-600/20" />
              <button
                onClick={() => { setPlayingId(featured.id); setIsPlaying(true); }}
                className="relative z-10 w-20 h-20 rounded-full bg-white/90 dark:bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:scale-110 transition-transform"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-zinc-900 dark:text-white ml-1">
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                </svg>
              </button>
              <span className="absolute top-4 left-4 px-3 py-1 text-xs font-medium rounded-full bg-violet-500/90 text-white">
                Featured
              </span>
            </div>

            {/* Info */}
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-zinc-500 dark:text-white/50">
                <span>EP {featured.number}</span>
                <span>·</span>
                <span>{featured.duration}</span>
                <span>·</span>
                <span>{featured.date}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/[0.08] border border-white/[0.08]">
                  {featured.category}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
                {featured.title}
              </h2>
              <p className="text-zinc-600 dark:text-white/60 leading-relaxed mb-5">
                {featured.description}
              </p>
              <button
                onClick={() => { setPlayingId(featured.id); setIsPlaying(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 text-white font-medium text-sm hover:bg-violet-500 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                </svg>
                Play Episode
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-violet-600 text-white'
                    : 'bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] text-zinc-700 dark:text-white/70 hover:bg-white/[0.1] dark:hover:bg-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Episode Grid */}
      <section className="px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            key={activeCategory}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((ep) => (
                <motion.article
                  key={ep.id}
                  variants={fadeUp}
                  layout
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group rounded-xl bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] overflow-hidden hover:scale-[1.02] hover:bg-white/[0.08] dark:hover:bg-white/[0.06] transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className={`relative aspect-video bg-gradient-to-br ${ep.thumbnail} flex items-center justify-center`}>
                    <button
                      onClick={() => { setPlayingId(ep.id); setIsPlaying(true); }}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white ml-0.5">
                        <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                      </svg>
                    </button>
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[11px] font-medium rounded-full bg-black/40 backdrop-blur-sm text-white">
                      EP {ep.number}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 text-[11px] font-medium rounded-full bg-black/40 backdrop-blur-sm text-white">
                      {ep.duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/[0.08] text-zinc-600 dark:text-white/60">
                        {ep.category}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-white/40">{ep.date}</span>
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
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-zinc-500 dark:text-white/40 py-16">
              No episodes in this category yet.
            </p>
          )}
        </div>
      </section>

      {/* Floating Corner Player */}
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
