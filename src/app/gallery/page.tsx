'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

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
  { id: 'neural-dreams', title: 'Neural Dreams', subtitle: 'AI-generated abstract landscapes', tags: ['Landscape'], date: '2025-06-15', imageUrl: 'https://picsum.photos/seed/neural-dreams/800/600', aspectRatio: 'landscape', featured: true },
  { id: 'digital-portrait', title: 'Digital Portrait', subtitle: 'Machine learning face synthesis', tags: ['Portrait'], date: '2025-06-10', imageUrl: 'https://picsum.photos/seed/digital-portrait/600/800', aspectRatio: 'portrait', featured: true },
  { id: 'synth-cityscape', title: 'Synth Cityscape', subtitle: 'Futuristic urban environments', tags: ['Architecture'], date: '2025-06-05', imageUrl: 'https://picsum.photos/seed/synth-cityscape/800/600', aspectRatio: 'landscape', featured: true },
  { id: 'abstract-flora', title: 'Abstract Flora', subtitle: 'Botanical patterns via diffusion', tags: ['Nature'], date: '2025-05-28', imageUrl: 'https://picsum.photos/seed/abstract-flora/700/700', aspectRatio: 'square' },
  { id: 'cyber-portrait', title: 'Cyber Portrait', subtitle: 'Neon-lit character studies', tags: ['Portrait', 'Cyberpunk'], date: '2025-05-20', imageUrl: 'https://picsum.photos/seed/cyber-portrait/600/800', aspectRatio: 'portrait' },
  { id: 'data-viz', title: 'Data Visualization', subtitle: 'Complex datasets as art', tags: ['Data'], date: '2025-05-15', imageUrl: 'https://picsum.photos/seed/data-viz/800/600', aspectRatio: 'landscape', featured: true },
  { id: 'minimal-forms', title: 'Minimal Forms', subtitle: 'Geometric abstraction by AI', tags: ['Minimal'], date: '2025-05-10', imageUrl: 'https://picsum.photos/seed/minimal-forms/700/700', aspectRatio: 'square' },
  { id: 'ethereal-space', title: 'Ethereal Space', subtitle: 'Cosmic exploration imagery', tags: ['Space'], date: '2025-05-05', imageUrl: 'https://picsum.photos/seed/ethereal-space/800/600', aspectRatio: 'landscape' },
  { id: 'retro-wave', title: 'Retro Wave', subtitle: 'Synthwave aesthetics generated', tags: ['Cyberpunk'], date: '2025-04-28', imageUrl: 'https://picsum.photos/seed/retro-wave/800/600', aspectRatio: 'landscape' },
  { id: 'nature-ai', title: 'Nature Reimagined', subtitle: 'AI interpretation of wilderness', tags: ['Nature'], date: '2025-04-20', imageUrl: 'https://picsum.photos/seed/nature-ai/600/800', aspectRatio: 'portrait' },
  { id: 'face-study', title: 'Face Study', subtitle: 'Generative portrait series', tags: ['Portrait'], date: '2025-04-15', imageUrl: 'https://picsum.photos/seed/face-study/700/700', aspectRatio: 'square', featured: true },
  { id: 'urban-layers', title: 'Urban Layers', subtitle: 'Multi-exposure city composites', tags: ['Architecture', 'Urban'], date: '2025-04-10', imageUrl: 'https://picsum.photos/seed/urban-layers/800/600', aspectRatio: 'landscape' },
  { id: 'dreamscapes', title: 'Dreamscapes', subtitle: 'Surreal AI-generated worlds', tags: ['Surreal'], date: '2025-04-05', imageUrl: 'https://picsum.photos/seed/dreamscapes/800/600', aspectRatio: 'landscape' },
  { id: 'pixel-art', title: 'Pixel Art Fusion', subtitle: 'Retro meets modern AI', tags: ['Pixel'], date: '2025-03-28', imageUrl: 'https://picsum.photos/seed/pixel-art/700/700', aspectRatio: 'square' },
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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Init shimmer animations for skeleton bars
  useEffect(() => {
    if (!loading) return;
    const bars = document.querySelectorAll('.shimmer-bar');
    bars.forEach((el, i) => {
      gsap.fromTo(el, { x: '-100%' }, { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay: i * 0.08 });
    });
  }, [loading]);

  // Animate frame corner borders on hero
  useEffect(() => {
    if (loading || !heroRef.current) return;
    const corners = heroRef.current.querySelectorAll('div');
    corners.forEach((el, i) => {
      gsap.fromTo(el,
        { scaleX: i % 2 === 0 ? 0 : 1, scaleY: i % 2 === 0 ? 1 : 0 },
        { scaleX: 1, scaleY: 1, duration: 0.8, delay: 0.3 + i * 0.08, ease: 'power2.out', overwrite: true }
      );
    });
  }, [loading, currentSlide]);

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

  const sortedItems = sortBy === 'newest'
    ? [...filteredItems].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [...filteredItems].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  const currentGroup = heroGroups[currentSlide] || heroGroups[0];

  return (
    <div className="min-h-screen">
      {/* Hero Section — generative canvas concept */}
      <section
        className="relative -mt-[72px] min-h-[calc(85vh+72px)] flex flex-col items-center justify-center overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Generative background — visible orbs + grid */}
        <div className="absolute inset-0 bg-white dark:bg-[#0a0a0b]">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#bf5af2]/15 dark:bg-[#bf5af2]/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/15 dark:bg-purple-500/10 blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-[#bf5af2]/10 to-purple-500/10 dark:from-[#bf5af2]/5 dark:to-purple-500/5 blur-2xl" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-8">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/[0.08] mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#bf5af2] animate-pulse" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Ethan&apos;s Blog · Gallery</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-zinc-900 dark:text-white tracking-tight leading-[0.9]">
              AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf5af2] to-purple-400">Gallery</span>
            </h1>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg max-w-xl mx-auto">
              Exploring the intersection of artificial intelligence and artistic expression
            </p>
          </motion.div>

          {/* Featured artwork */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-full max-w-3xl mx-auto"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/40 border border-zinc-200 dark:border-white/[0.08]"
                onContextMenu={(e) => e.preventDefault()}
              >
                <img
                  src={currentGroup[0].imageUrl}
                  alt={currentGroup[0].title}
                  draggable={false}
                  className="w-full aspect-[16/10] object-cover select-none pointer-events-none"
                />
                {/* Scan line overlay — visible */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px)',
                    backgroundSize: '100% 3px',
                  }}
                />
                {/* Bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-sm font-medium">{currentGroup[0].title}</p>
                  <p className="text-zinc-300 text-xs mt-0.5">{currentGroup[0].subtitle}</p>
                </div>
              </div>
              {/* Tags */}
              <div className="flex items-center justify-center gap-3 mt-4">
                {currentGroup[0].tags.map(tag => (
                  <span key={tag} className="text-[11px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slide indicators */}
          <div className="flex gap-2 mt-10">
            {heroGroups.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide
                    ? 'w-6 bg-[#bf5af2]'
                    : 'w-2.5 bg-zinc-300 dark:bg-white/15 hover:bg-zinc-400 dark:hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar — floating pill like navbar */}
      <div className="sticky top-[72px] z-40 flex justify-center px-4 py-3">
        <div className="glass-nav-acrylic rounded-full px-5 py-2.5 flex items-center gap-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                activeTag === null
                  ? 'bg-[#bf5af2] text-white shadow-sm shadow-[#bf5af2]/20'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  activeTag === tag
                    ? 'bg-[#bf5af2] text-white shadow-sm shadow-[#bf5af2]/20'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-zinc-200 dark:bg-white/10 mx-1" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                sortBy === 'newest' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                sortBy === 'oldest' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              Oldest
            </button>
          </div>
        </div>
      </div>

      {/* Masonry Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {['280px', '360px', '240px', '320px', '260px', '380px'].map((h, i) => (
              <div key={i} className="mb-4 break-inside-avoid rounded-xl bg-zinc-200/60 dark:bg-white/[0.04] overflow-hidden relative" style={{ height: h }}>
                <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/[0.06] to-transparent" />
              </div>
            ))}
          </div>
        ) : (
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
        )}
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
