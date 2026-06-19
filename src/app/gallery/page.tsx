'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

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

  const featured = galleryData.filter(item => item.featured).slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black/40 pointer-events-none" />
        
        {/* Featured images grid */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-3 p-8 opacity-40">
          {featured.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: i * 0.15 }}
              className={`rounded-xl overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
              onContextMenu={(e) => e.preventDefault()}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                draggable={false}
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </motion.div>
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
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto px-4">
            Exploring the intersection of artificial intelligence and artistic expression
          </p>
        </motion.div>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-[72px] z-40 backdrop-blur-xl bg-white/[0.02] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 ${
                activeTag === null
                  ? 'bg-[#bf5af2] text-white shadow-lg shadow-[#bf5af2]/20'
                  : 'bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 ${
                  activeTag === tag
                    ? 'bg-[#bf5af2] text-white shadow-lg shadow-[#bf5af2]/20'
                    : 'bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-zinc-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Sort:</span>
            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 ${
                sortBy === 'date'
                  ? 'bg-white/[0.1] text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Date
            </button>
            <button
              onClick={() => setSortBy('category')}
              className={`px-3 py-1.5 text-xs rounded-full transition-all duration-300 ${
                sortBy === 'category'
                  ? 'bg-white/[0.1] text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Category
            </button>
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
            {sortedItems.map((item, i) => (
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
