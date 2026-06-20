'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GallerySkeleton from '@/components/GallerySkeleton';

interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  tags: string[];
  date: string;
  imageUrl: string;
  aspectRatio: 'portrait' | 'landscape' | 'square';
  featured?: boolean;
}

const galleryData: GalleryItem[] = [
  { id: 'neural-dreams', title: 'Neural Dreams', subtitle: 'AI-generated abstract landscapes', tags: ['AI Art', 'Landscape'], date: '2025-06-15', imageUrl: 'https://picsum.photos/seed/neural-dreams/800/600', aspectRatio: 'landscape', featured: true },
  { id: 'digital-portrait', title: 'Digital Portrait', subtitle: 'Machine learning face synthesis', tags: ['AI Art', 'Portrait'], date: '2025-06-10', imageUrl: 'https://picsum.photos/seed/digital-portrait/600/800', aspectRatio: 'portrait', featured: true },
  { id: 'synth-cityscape', title: 'Synth Cityscape', subtitle: 'Futuristic urban environments', tags: ['Architecture', 'AI Art'], date: '2025-06-05', imageUrl: 'https://picsum.photos/seed/synth-cityscape/800/600', aspectRatio: 'landscape', featured: true },
  { id: 'abstract-flora', title: 'Abstract Flora', subtitle: 'Botanical patterns via diffusion', tags: ['AI Art', 'Nature'], date: '2025-05-28', imageUrl: 'https://picsum.photos/seed/abstract-flora/700/700', aspectRatio: 'square' },
  { id: 'cyber-portrait', title: 'Cyber Portrait', subtitle: 'Neon-lit character studies', tags: ['Portrait', 'Cyberpunk'], date: '2025-05-20', imageUrl: 'https://picsum.photos/seed/cyber-portrait/600/800', aspectRatio: 'portrait' },
  { id: 'data-viz', title: 'Data Visualization', subtitle: 'Complex datasets as art', tags: ['Data', 'AI Art'], date: '2025-05-15', imageUrl: 'https://picsum.photos/seed/data-viz/800/600', aspectRatio: 'landscape', featured: true },
  { id: 'minimal-forms', title: 'Minimal Forms', subtitle: 'Geometric abstraction by AI', tags: ['AI Art', 'Minimal'], date: '2025-05-10', imageUrl: 'https://picsum.photos/seed/minimal-forms/700/700', aspectRatio: 'square' },
  { id: 'ethereal-space', title: 'Ethereal Space', subtitle: 'Cosmic exploration imagery', tags: ['AI Art', 'Space'], date: '2025-05-05', imageUrl: 'https://picsum.photos/seed/ethereal-space/800/600', aspectRatio: 'landscape' },
  { id: 'retro-wave', title: 'Retro Wave', subtitle: 'Synthwave aesthetics generated', tags: ['Cyberpunk', 'AI Art'], date: '2025-04-28', imageUrl: 'https://picsum.photos/seed/retro-wave/800/600', aspectRatio: 'landscape' },
  { id: 'nature-ai', title: 'Nature Reimagined', subtitle: 'AI interpretation of wilderness', tags: ['Nature', 'AI Art'], date: '2025-04-20', imageUrl: 'https://picsum.photos/seed/nature-ai/600/800', aspectRatio: 'portrait' },
  { id: 'face-study', title: 'Face Study', subtitle: 'Generative portrait series', tags: ['Portrait', 'AI Art'], date: '2025-04-15', imageUrl: 'https://picsum.photos/seed/face-study/700/700', aspectRatio: 'square', featured: true },
  { id: 'urban-layers', title: 'Urban Layers', subtitle: 'Multi-exposure city composites', tags: ['Architecture', 'Urban'], date: '2025-04-10', imageUrl: 'https://picsum.photos/seed/urban-layers/800/600', aspectRatio: 'landscape' },
  { id: 'dreamscapes', title: 'Dreamscapes', subtitle: 'Surreal AI-generated worlds', tags: ['AI Art', 'Surreal'], date: '2025-04-05', imageUrl: 'https://picsum.photos/seed/dreamscapes/800/600', aspectRatio: 'landscape' },
  { id: 'pixel-art', title: 'Pixel Art Fusion', subtitle: 'Retro meets modern AI', tags: ['AI Art', 'Pixel'], date: '2025-03-28', imageUrl: 'https://picsum.photos/seed/pixel-art/700/700', aspectRatio: 'square' },
  { id: 'macro-world', title: 'Macro World', subtitle: 'Extreme close-up generation', tags: ['Nature', 'Macro'], date: '2025-03-20', imageUrl: 'https://picsum.photos/seed/macro-world/600/800', aspectRatio: 'portrait' },
];

const allTags = Array.from(new Set(galleryData.flatMap(item => item.tags)));

// Create groups of 5 for hero slideshow
const SLIDE_SIZE = 5;
const heroGroups: GalleryItem[][] = [];
for (let i = 0; i < galleryData.length; i += SLIDE_SIZE) {
  heroGroups.push(galleryData.slice(i, i + SLIDE_SIZE));
}

function GalleryCard({ item, onOpen, likes, onLike }: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
  likes: number;
  onLike: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="mb-4 break-inside-avoid group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-500"
        onClick={() => onOpen(item)}
        style={{ aspectRatio: item.aspectRatio === 'portrait' ? '3/4' : item.aspectRatio === 'square' ? '1/1' : '4/3' }}
      >
        {/* Image with protection */}
        <div className="absolute inset-0" onContextMenu={(e) => e.preventDefault()}>
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-700 group-hover:scale-105"
          />
          {/* Transparent overlay for protection */}
          <div className="absolute inset-0 z-10" />
        </div>

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4"
            >
              <h3 className="text-white font-semibold text-lg">{item.title}</h3>
              <p className="text-zinc-300 text-sm mt-1">{item.subtitle}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {item.tags.map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-200 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-zinc-400 text-xs">{new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
                  className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-[#bf5af2] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={likes > 0 ? '#bf5af2' : 'none'} stroke={likes > 0 ? '#bf5af2' : 'currentColor'} strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {likes}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Always visible like button */}
        {!isHovered && (
          <div className="absolute top-3 right-3 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
              className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-[#bf5af2] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={likes > 0 ? '#bf5af2' : 'none'} stroke={likes > 0 ? '#bf5af2' : 'currentColor'} strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('gallery-likes');
    if (stored) setLikes(JSON.parse(stored));
  }, []);

  const handleLike = useCallback((id: string) => {
    setLikes(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      localStorage.setItem('gallery-likes', JSON.stringify(next));
      return next;
    });
  }, []);

  const filteredItems = activeTag
    ? galleryData.filter(item => item.tags.includes(activeTag))
    : galleryData;

  const sortedItems = sortBy === 'date'
    ? [...filteredItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [...filteredItems].sort((a, b) => a.tags[0].localeCompare(b.tags[0]));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Hero slideshow auto-rotation
  useEffect(() => {
    if (isPaused || loading) return;
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroGroups.length);
    }, 4500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, loading]);

  if (loading) {
    return <GallerySkeleton />;
  }

  const currentGroup = heroGroups[currentSlide] || heroGroups[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden dark:bg-zinc-950"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-0 bg-black/40 dark:bg-black/20 pointer-events-none" />

        {/* Featured images grid with auto-rotation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 gap-3 p-8"
          >
            {(() => {
              // 4 different hero layouts, randomly picked per slide
              const layouts = [
                // Layout 0: Big left (4col×2row, first spans 2×2)
                { grid: 'grid grid-cols-4 grid-rows-2', classes: ['col-span-2 row-span-2', '', '', '', ''] },
                // Layout 1: Big right (4col×2row, last big)
                { grid: 'grid grid-cols-4 grid-rows-2', classes: ['', '', '', 'col-start-3 col-span-2 row-span-2', ''] },
                // Layout 2: Top hero + bottom 3 (4col×2row)
                { grid: 'grid grid-cols-4 grid-rows-2', classes: ['col-span-2 row-span-2', 'col-start-3', 'col-start-4', 'col-start-3 row-start-2', 'col-start-4 row-start-2'] },
                // Layout 3: Center big (5col×2row)
                { grid: 'grid grid-cols-5 grid-rows-2', classes: ['', '', 'col-start-2 col-span-2 row-span-2', '', ''] },
              ];
              const layout = layouts[currentSlide % layouts.length];
              return (
                <div className={layout.grid + ' w-full h-full'}>
                  {currentGroup.slice(0, 5).map((item, i) => (
                    <div
                      key={item.id}
                      className={`relative rounded-xl overflow-hidden ${layout.classes[i] || ''}`}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        draggable={false}
                        className="w-full h-full object-cover select-none pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              );
            })()}
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroGroups.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide
                  ? 'w-8 bg-[#bf5af2]'
                  : 'w-3 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] mb-6">
            <div className="w-2 h-2 rounded-full bg-[#bf5af2] animate-pulse" />
            <span className="text-sm text-zinc-300">AI-Generated Collection</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-white tracking-tight">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf5af2] to-purple-300">Gallery</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-300 dark:text-zinc-400 max-w-2xl mx-auto px-4">
            Exploring the intersection of artificial intelligence and artistic expression
          </p>
        </motion.div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-white/70 dark:bg-white/[0.04] backdrop-blur-2xl border border-zinc-200/80 dark:border-white/[0.08] shadow-lg shadow-black/[0.03] dark:shadow-black/20">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                  activeTag === null
                    ? 'bg-[#bf5af2] text-white shadow-md shadow-[#bf5af2]/25'
                    : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.12] hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
                    activeTag === tag
                      ? 'bg-[#bf5af2] text-white shadow-md shadow-[#bf5af2]/25'
                      : 'bg-zinc-100 dark:bg-white/[0.06] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/[0.12] hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {/* Sort Toggle */}
            <div className="flex items-center bg-zinc-100 dark:bg-white/[0.04] backdrop-blur-md rounded-xl border border-zinc-200/80 dark:border-white/[0.06] p-1 relative flex-shrink-0">
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-white dark:bg-white/[0.1] shadow-sm transition-all duration-300 ease-out"
                style={{ left: sortBy === 'date' ? '4px' : '50%', width: 'calc(50% - 4px)' }}
              />
              <button
                onClick={() => setSortBy('date')}
                className="relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-200 rounded-lg w-1/2 text-center"
              >
                <span className={sortBy === 'date' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}>Date</span>
              </button>
              <button
                onClick={() => setSortBy('category')}
                className="relative z-10 px-5 py-2 text-sm font-medium transition-colors duration-200 rounded-lg w-1/2 text-center"
              >
                <span className={sortBy === 'category' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'}>Category</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {sortedItems.map((item) => (
              <GalleryCard
                key={item.id}
                item={item}
                onOpen={setSelectedItem}
                likes={likes[item.id] || 0}
                onLike={handleLike}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-5xl w-full max-h-[90vh] overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-2/3 relative" onContextMenu={(e) => e.preventDefault()}>
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    draggable={false}
                    className="w-full h-full object-cover select-none pointer-events-none"
                    style={{ maxHeight: '70vh' }}
                  />
                  <div className="absolute inset-0" />
                </div>

                {/* Metadata */}
                <div className="lg:w-1/3 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                    <p className="text-zinc-400 mt-2">{selectedItem.subtitle}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {selectedItem.tags.map(tag => (
                        <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-[#bf5af2]/10 text-[#bf5af2] border border-[#bf5af2]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-zinc-500 text-sm mt-4">
                      {new Date(selectedItem.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2">
                    <button
                      onClick={() => handleLike(selectedItem.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#bf5af2]/10 border border-[#bf5af2]/20 text-[#bf5af2] hover:bg-[#bf5af2]/20 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill={likes[selectedItem.id] ? '#bf5af2' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {likes[selectedItem.id] || 0} Likes
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
