'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

interface Photo {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
  date: string;
  location?: string;
}

// Placeholder data — replace with real photos
const photos: Photo[] = [
  { id: 'p1', title: 'Golden Hour', category: 'Landscape', imageUrl: 'https://picsum.photos/seed/photo1/1200/800', camera: 'Sony A7III', lens: '24-70mm f/2.8', aperture: 'f/8', shutter: '1/250', iso: '100', date: '2025-06-15', location: 'St. Louis, MO' },
  { id: 'p2', title: 'Urban Geometry', category: 'Architecture', imageUrl: 'https://picsum.photos/seed/photo2/800/1200', camera: 'Fuji X-T5', lens: '16mm f/1.4', aperture: 'f/5.6', shutter: '1/500', iso: '200', date: '2025-06-10' },
  { id: 'p3', title: 'Quiet Street', category: 'Street', imageUrl: 'https://picsum.photos/seed/photo3/1200/800', camera: 'Leica Q3', lens: '28mm f/1.7', aperture: 'f/2.8', shutter: '1/125', iso: '400', date: '2025-05-28', location: 'Downtown' },
  { id: 'p4', title: 'Morning Mist', category: 'Landscape', imageUrl: 'https://picsum.photos/seed/photo4/1200/900', camera: 'Sony A7III', lens: '70-200mm f/2.8', aperture: 'f/11', shutter: '1/60', iso: '100', date: '2025-05-20' },
  { id: 'p5', title: 'Neon Reflections', category: 'Night', imageUrl: 'https://picsum.photos/seed/photo5/800/1200', camera: 'Fuji X-T5', lens: '35mm f/1.4', aperture: 'f/1.4', shutter: '1/30', iso: '3200', date: '2025-05-15', location: 'WashU Campus' },
  { id: 'p6', title: 'Concrete Waves', category: 'Architecture', imageUrl: 'https://picsum.photos/seed/photo6/1200/800', camera: 'Sony A7III', lens: '14mm f/2.8', aperture: 'f/8', shutter: '1/200', iso: '100', date: '2025-05-10' },
  { id: 'p7', title: 'Rain on Glass', category: 'Abstract', imageUrl: 'https://picsum.photos/seed/photo7/1000/1000', camera: 'Leica Q3', lens: '28mm f/1.7', aperture: 'f/4', shutter: '1/100', iso: '800', date: '2025-04-28' },
  { id: 'p8', title: 'The Observer', category: 'Street', imageUrl: 'https://picsum.photos/seed/photo8/800/1200', camera: 'Fuji X-T5', lens: '56mm f/1.2', aperture: 'f/2', shutter: '1/500', iso: '200', date: '2025-04-20' },
  { id: 'p9', title: 'Sunset Layers', category: 'Landscape', imageUrl: 'https://picsum.photos/seed/photo9/1200/800', camera: 'Sony A7III', lens: '24-70mm f/2.8', aperture: 'f/11', shutter: '1/30', iso: '100', date: '2025-04-15', location: 'Forest Park' },
  { id: 'p10', title: 'Light Study', category: 'Abstract', imageUrl: 'https://picsum.photos/seed/photo10/1000/1000', camera: 'Leica Q3', lens: '28mm f/1.7', aperture: 'f/2.8', shutter: '1/250', iso: '200', date: '2025-04-10' },
  { id: 'p11', title: 'Night Walk', category: 'Night', imageUrl: 'https://picsum.photos/seed/photo11/1200/800', camera: 'Fuji X-T5', lens: '23mm f/1.4', aperture: 'f/1.4', shutter: '1/15', iso: '6400', date: '2025-03-28' },
  { id: 'p12', title: 'Architectural Echo', category: 'Architecture', imageUrl: 'https://picsum.photos/seed/photo12/800/1200', camera: 'Sony A7III', lens: '16-35mm f/2.8', aperture: 'f/8', shutter: '1/125', iso: '100', date: '2025-03-20' },
];

const categories = ['All', ...Array.from(new Set(photos.map(p => p.category)))];

// Film grain overlay component
function FilmGrain() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] opacity-[0.03] dark:opacity-[0.05]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '128px 128px',
      }}
    />
  );
}

// Film perforation decoration
function FilmPerforations({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <div className={`absolute top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-6 flex flex-col items-center justify-evenly py-4 z-10`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="w-3 h-4 rounded-sm bg-black/20 dark:bg-white/10 border border-black/10 dark:border-white/5" />
      ))}
    </div>
  );
}

// EXIF badge component
function ExifBadge({ icon, value }: { icon: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/5 dark:bg-white/[0.06] text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
      <span className="opacity-60">{icon}</span>{value}
    </span>
  );
}

export default function PhotographyPage() {
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const filmstripRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
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

  const filteredPhotos = activeCategory === 'All' ? photos : photos.filter(p => p.category === activeCategory);
  const featuredPhotos = photos.slice(0, 5);

  const openLightbox = useCallback((photo: Photo) => {
    const idx = filteredPhotos.findIndex(p => p.id === photo.id);
    setLightboxIndex(idx);
    setSelectedPhoto(photo);
  }, [filteredPhotos]);

  const navigateLightbox = useCallback((dir: number) => {
    const newIdx = (lightboxIndex + dir + filteredPhotos.length) % filteredPhotos.length;
    setLightboxIndex(newIdx);
    setSelectedPhoto(filteredPhotos[newIdx]);
  }, [lightboxIndex, filteredPhotos]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedPhoto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedPhoto, navigateLightbox]);

  return (
    <div className="min-h-screen">
      {/* ═══ Hero — always visible ═══ */}
      <section className="relative -mt-[72px] h-[calc(92vh+72px)] overflow-hidden bg-black dark:bg-[#0a0a0b]">
        <FilmGrain />
        {/* Featured photo background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={featuredPhotos[0].id}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <img
              src={featuredPhotos[0].imageUrl}
              alt={featuredPhotos[0].title}
              className="w-full h-full object-cover opacity-50"
              draggable={false}
              onContextMenu={e => e.preventDefault()}
            />
          </motion.div>
        </AnimatePresence>
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-[2]" />
        {/* Letterbox bars (cinematic) */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-black z-[3]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-black z-[3]" />
        {/* Hero content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-24 left-0 right-0 z-[4] px-8 max-w-7xl mx-auto"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-amber-400" />
            <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-medium">Ethan&apos;s Blog · Photography</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.95]">
            Through<br />
            <span className="text-zinc-400">the Lens</span>
          </h1>
          <p className="mt-4 text-zinc-400 text-lg max-w-lg">
            Capturing moments between light and shadow
          </p>
        </motion.div>
        {/* Camera frame corners */}
        <div className="absolute top-16 left-6 w-12 h-12 border-l-2 border-t-2 border-white/20 z-[5]" />
        <div className="absolute top-16 right-6 w-12 h-12 border-r-2 border-t-2 border-white/20 z-[5]" />
        <div className="absolute bottom-16 left-6 w-12 h-12 border-l-2 border-b-2 border-white/20 z-[5]" />
        <div className="absolute bottom-16 right-6 w-12 h-12 border-r-2 border-b-2 border-white/20 z-[5]" />
      </section>

      {/* ═══ Category Filmstrip ═══ */}
      <section className="bg-black dark:bg-[#0a0a0b] py-6 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 mr-2 flex-shrink-0">Filter</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex-shrink-0 ${
                  activeCategory === cat
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-zinc-500 hover:text-zinc-300 border border-transparent hover:border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Featured Filmstrip (horizontal scroll) ═══ */}
      <section className="bg-black dark:bg-[#0a0a0b] py-12 relative overflow-hidden">
        <FilmGrain />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Featured</span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
          </div>
        </div>
        {loading ? (
          <div className="flex gap-4 px-4 sm:px-6 pb-4">
            {[320, 400, 360, 340, 380].map((w, i) => (
              <div key={i} className="flex-shrink-0 rounded-lg overflow-hidden relative bg-white/[0.02]" style={{ width: w, height: w * 0.667 }}>
                <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              </div>
            ))}
          </div>
        ) : (
        <div ref={filmstripRef} className="flex gap-4 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-4 snap-x snap-mandatory">
          {featuredPhotos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex-shrink-0 snap-center group cursor-pointer"
              onClick={() => openLightbox(photo)}
            >
              <div className="relative w-[320px] md:w-[400px] aspect-[3/2] rounded-lg overflow-hidden bg-zinc-900">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  draggable={false}
                  onContextMenu={e => e.preventDefault()}
                />
                {/* Film frame border */}
                <div className="absolute inset-0 border-2 border-white/[0.06] rounded-lg pointer-events-none" />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-medium text-sm">{photo.title}</p>
                    <p className="text-zinc-400 text-xs mt-0.5">{photo.camera} · {photo.aperture}</p>
                  </div>
                </div>
                {/* Frame number */}
                <div className="absolute top-3 right-3 text-[10px] font-mono text-white/30">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        )}
      </section>

      {/* ═══ Photo Grid ═══ */}
      <section className="bg-[#0a0a0b] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Collection</span>
            <div className="flex-1 h-[1px] bg-white/[0.06]" />
            <span className="text-xs text-zinc-600 font-mono">{filteredPhotos.length} photos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden relative bg-white/[0.02]">
                  <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
                </div>
              ))
            ) : (
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group cursor-pointer"
                  onClick={() => openLightbox(photo)}
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-110"
                      draggable={false}
                      onContextMenu={e => e.preventDefault()}
                    />
                    {/* Film border */}
                    <div className="absolute inset-0 border border-white/[0.04] rounded-xl pointer-events-none" />
                    {/* Info overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/20">
                            {photo.category}
                          </span>
                        </div>
                        <h3 className="text-white font-semibold text-lg">{photo.title}</h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <ExifBadge icon="📷" value={photo.camera} />
                          <ExifBadge icon="◉" value={photo.aperture} />
                          <ExifBadge icon="⏱" value={photo.shutter} />
                          <ExifBadge icon="ISO" value={photo.iso} />
                        </div>
                        {photo.location && (
                          <p className="text-zinc-500 text-xs mt-2">📍 {photo.location}</p>
                        )}
                      </div>
                    </div>
                    {/* Frame number */}
                    <div className="absolute top-3 left-3 text-[10px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            )}
          </div>
        </div>
      </section>

      {/* ═══ Lightbox ═══ */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">{selectedPhoto.category}</span>
                <span className="text-xs text-zinc-600 font-mono">
                  {lightboxIndex + 1} / {filteredPhotos.length}
                </span>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            {/* Main image */}
            <div className="flex-1 flex items-center justify-center px-6 relative" onClick={e => e.stopPropagation()}>
              {/* Nav arrows */}
              <button
                onClick={() => navigateLightbox(-1)}
                className="absolute left-6 w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
              >
                ‹
              </button>
              <motion.img
                key={selectedPhoto.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="max-h-[70vh] max-w-full object-contain rounded-lg"
                draggable={false}
                onContextMenu={e => e.preventDefault()}
              />
              <button
                onClick={() => navigateLightbox(1)}
                className="absolute right-6 w-12 h-12 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white transition-colors z-10"
              >
                ›
              </button>
            </div>
            {/* Bottom info bar */}
            <div className="px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/[0.06]">
              <div>
                <h3 className="text-white text-lg font-semibold">{selectedPhoto.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <ExifBadge icon="📷" value={selectedPhoto.camera} />
                  <ExifBadge icon="◎" value={selectedPhoto.lens} />
                  <ExifBadge icon="◉" value={selectedPhoto.aperture} />
                  <ExifBadge icon="⏱" value={selectedPhoto.shutter} />
                  <ExifBadge icon="ISO" value={selectedPhoto.iso} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-sm font-mono">{selectedPhoto.date}</p>
                {selectedPhoto.location && <p className="text-zinc-600 text-xs mt-1">{selectedPhoto.location}</p>}
              </div>
            </div>
            {/* Film strip */}
            <div className="flex gap-2 px-6 pb-5 overflow-x-auto scrollbar-hide">
              {filteredPhotos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); setSelectedPhoto(p); }}
                  className={`flex-shrink-0 w-16 h-12 rounded overflow-hidden border-2 transition-all ${
                    i === lightboxIndex ? 'border-amber-500 opacity-100' : 'border-transparent opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={p.imageUrl} alt="" className="w-full h-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══ Skeleton ═══
function PhotographySkeleton() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const shimmers = ref.current.querySelectorAll('.shimmer-bar');
    shimmers.forEach((el, i) => {
      gsap.fromTo(el, { x: '-100%' }, { x: '200%', duration: 1.5, ease: 'none', repeat: -1, delay: i * 0.08 });
    });
  }, []);

  return (
    <div ref={ref} className="min-h-screen bg-black dark:bg-[#0a0a0b]">
      {/* Hero skeleton */}
      <section className="relative -mt-[72px] h-[calc(92vh+72px)] overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 shimmer-bar bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        {/* Letterbox bars */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-black z-[3]" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-black z-[3]" />
        {/* Camera frame corners */}
        <div className="absolute top-16 left-6 w-12 h-12 border-l-2 border-t-2 border-white/10 z-[5]" />
        <div className="absolute top-16 right-6 w-12 h-12 border-r-2 border-t-2 border-white/10 z-[5]" />
        <div className="absolute bottom-16 left-6 w-12 h-12 border-l-2 border-b-2 border-white/10 z-[5]" />
        <div className="absolute bottom-16 right-6 w-12 h-12 border-r-2 border-b-2 border-white/10 z-[5]" />
        {/* Text skeleton */}
        <div className="absolute bottom-24 left-8 z-[4] space-y-4">
          <div className="w-32 h-4 rounded bg-white/[0.06] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
          </div>
          <div className="w-72 h-14 rounded-lg bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
          <div className="w-56 h-5 rounded bg-white/[0.03] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
          </div>
        </div>
      </section>
      {/* Category bar skeleton */}
      <section className="bg-black dark:bg-[#0a0a0b] py-6 border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-3">
          {[48, 56, 64, 44, 52].map((w, i) => (
            <div key={i} className="rounded-lg overflow-hidden relative flex-shrink-0" style={{ width: w, height: 36 }}>
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent bg-white/[0.03]" />
            </div>
          ))}
        </div>
      </section>
      {/* Filmstrip skeleton */}
      <section className="bg-black dark:bg-[#0a0a0b] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
          <div className="w-16 h-3 rounded bg-white/[0.04] overflow-hidden relative">
            <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
          <div className="flex-1 h-[1px] bg-white/[0.06]" />
        </div>
        <div className="flex gap-4 px-4 sm:px-6">
          {[320, 400, 360, 340, 380].map((w, i) => (
            <div key={i} className="flex-shrink-0 rounded-lg overflow-hidden relative" style={{ width: w, height: w * 0.667 }}>
              <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent bg-white/[0.02]" />
            </div>
          ))}
        </div>
      </section>
      {/* Grid skeleton */}
      <section className="bg-[#0a0a0b] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden relative bg-white/[0.02]">
                <div className="shimmer-bar absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
